import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import validator from "validator";
import { nanoid } from "nanoid";
import crypto from "crypto";
import dotenv from "dotenv";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Razorpay from "razorpay";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 5178);
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const NODE_ENV = process.env.NODE_ENV || "development";
const COOKIE_SECURE = process.env.COOKIE_SECURE === "true" || NODE_ENV === "production";

const ADMIN_EMAILS = new Set(
  String(process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
);

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } })
    : null;

const CLOUDINARY_ENABLED = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
if (CLOUDINARY_ENABLED) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

const DATA_DIR = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [] }, null, 2), "utf8");
}

function readUsers() {
  ensureDataFiles();
  const raw = fs.readFileSync(USERS_FILE, "utf8");
  const parsed = JSON.parse(raw || "{}");
  if (!parsed.users || !Array.isArray(parsed.users)) return { users: [] };
  return parsed;
}

function writeUsers(db) {
  ensureDataFiles();
  fs.writeFileSync(USERS_FILE, JSON.stringify(db, null, 2), "utf8");
}

function normalizePhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  // Accept 10-digit Indian mobile (basic demo). You can expand later.
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  return digits;
}

function isEmailOrPhone(identifier) {
  const s = String(identifier || "").trim();
  if (!s) return { kind: "none", value: "" };
  if (validator.isEmail(s)) return { kind: "email", value: s.toLowerCase() };
  const phone = normalizePhone(s);
  if (phone.length === 10) return { kind: "phone", value: phone };
  return { kind: "invalid", value: s };
}

function validatePassword(pw) {
  const s = String(pw || "");
  const rules = {
    min8: s.length >= 8,
    upper: /[A-Z]/.test(s),
    lower: /[a-z]/.test(s),
    number: /\d/.test(s),
    special: /[^A-Za-z0-9]/.test(s),
  };
  const ok = Object.values(rules).every(Boolean);
  return { ok, rules };
}

function signSession(user, remember) {
  const payload = { sub: user.id, email: user.email ?? null, phone: user.phone ?? null, name: user.name };
  const expiresIn = remember ? "30d" : "2h";
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

function setSessionCookie(res, token, remember) {
  res.cookie("rrb_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: COOKIE_SECURE,
    maxAge: remember ? 1000 * 60 * 60 * 24 * 30 : 1000 * 60 * 60 * 2,
    path: "/",
  });
}

function clearSessionCookie(res) {
  res.clearCookie("rrb_session", { path: "/" });
}

function authMiddleware(req, res, next) {
  const token = req.cookies?.rrb_session;
  if (!token) return res.status(401).json({ ok: false, error: "Not authenticated" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ ok: false, error: "Invalid session" });
  }
}

function adminOnly(req, res, next) {
  const email = String(req.user?.email || "").toLowerCase();
  if (!email || ADMIN_EMAILS.size === 0 || !ADMIN_EMAILS.has(email)) {
    return res.status(403).json({ ok: false, error: "Admin access required" });
  }
  return next();
}

// OTP store: Map(key => { otpHash, expiresAt, attemptsLeft, lastSentAt, resendCount })
const otpStore = new Map();
const OTP_TTL_MS = 3 * 60 * 1000; // 3 minutes
const OTP_ATTEMPTS = 6;

function otpKey(kind, value) {
  return `${kind}:${value}`;
}

function generateOtp() {
  // crypto-secure 6 digits, leading zeros allowed
  const n = crypto.randomInt(0, 1_000_000);
  return String(n).padStart(6, "0");
}

function maskIdentifier(kind, value) {
  if (kind === "email") {
    const [u, d] = value.split("@");
    return `${u.slice(0, 2)}***@${d}`;
  }
  if (kind === "phone") return `******${value.slice(-4)}`;
  return "***";
}

const app = express();
app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
});

app.post("/api/signup", async (req, res) => {
  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim().toLowerCase();
  const phone = normalizePhone(req.body?.phone);
  const password = String(req.body?.password || "");

  if (!name || name.length < 2) return res.status(400).json({ ok: false, error: "Name is required" });
  if (!validator.isEmail(email)) return res.status(400).json({ ok: false, error: "Valid email required" });
  if (phone.length !== 10) return res.status(400).json({ ok: false, error: "Valid 10-digit phone required" });

  const pass = validatePassword(password);
  if (!pass.ok) return res.status(400).json({ ok: false, error: "Password does not meet requirements", rules: pass.rules });

  const db = readUsers();
  if (db.users.some((u) => u.email === email)) return res.status(409).json({ ok: false, error: "Email already registered" });
  if (db.users.some((u) => u.phone === phone)) return res.status(409).json({ ok: false, error: "Phone already registered" });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = {
    id: nanoid(16),
    name,
    email,
    phone,
    passwordHash,
    createdAt: new Date().toISOString(),
  };
  db.users.unshift(user);
  writeUsers(db);

  const token = signSession(user, true);
  setSessionCookie(res, token, true);
  res.json({ ok: true, user: { name: user.name, email: user.email, phone: user.phone } });
});

app.post("/api/login", async (req, res) => {
  const identifierRaw = String(req.body?.identifier || "").trim();
  const password = String(req.body?.password || "");
  const remember = !!req.body?.remember;

  const id = isEmailOrPhone(identifierRaw);
  if (id.kind === "invalid" || id.kind === "none") return res.status(400).json({ ok: false, error: "Enter a valid email or phone" });
  if (!password) return res.status(400).json({ ok: false, error: "Password required" });

  const db = readUsers();
  const user = db.users.find((u) => (id.kind === "email" ? u.email === id.value : u.phone === id.value));
  if (!user) return res.status(401).json({ ok: false, error: "Wrong credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ ok: false, error: "Wrong credentials" });

  const token = signSession(user, remember);
  setSessionCookie(res, token, remember);
  res.json({ ok: true, user: { name: user.name, email: user.email, phone: user.phone } });
});

app.post("/api/logout", (req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

app.get("/api/me", (req, res) => {
  const token = req.cookies?.rrb_session;
  if (!token) return res.json({ ok: true, user: null });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return res.json({ ok: true, user: { name: payload.name, email: payload.email, phone: payload.phone } });
  } catch {
    return res.json({ ok: true, user: null });
  }
});

app.post("/api/send-otp", otpLimiter, async (req, res) => {
  const identifierRaw = String(req.body?.identifier || "").trim();
  const channel = String(req.body?.channel || "email").toLowerCase(); // "email" | "sms"

  const id = isEmailOrPhone(identifierRaw);
  if (id.kind === "invalid" || id.kind === "none") return res.status(400).json({ ok: false, error: "Enter a valid email or phone" });
  if (!["email", "sms"].includes(channel)) return res.status(400).json({ ok: false, error: "Invalid channel" });

  const db = readUsers();
  const user = db.users.find((u) => (id.kind === "email" ? u.email === id.value : u.phone === id.value));
  // Don't reveal whether user exists
  const masked = maskIdentifier(id.kind, id.value);

  const key = otpKey(id.kind, id.value);
  const now = Date.now();
  const existing = otpStore.get(key);
  if (existing && existing.lastSentAt && now - existing.lastSentAt < 30_000) {
    return res.status(429).json({ ok: false, error: "Please wait before requesting another OTP" });
  }

  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  otpStore.set(key, {
    otpHash,
    expiresAt: now + OTP_TTL_MS,
    attemptsLeft: OTP_ATTEMPTS,
    lastSentAt: now,
    resendCount: (existing?.resendCount || 0) + 1,
    userExists: !!user,
  });

  // Demo "send": log to server console
  console.log(`[OTP] channel=${channel} to=${key} otp=${otp} expiresInSec=${Math.round(OTP_TTL_MS / 1000)}`);

  const payload = { ok: true, masked, expiresInSec: Math.round(OTP_TTL_MS / 1000) };
  if (NODE_ENV !== "production") payload.devOtp = otp;
  return res.json(payload);
});

app.post("/api/verify-otp", async (req, res) => {
  const identifierRaw = String(req.body?.identifier || "").trim();
  const otp = String(req.body?.otp || "").trim();

  const id = isEmailOrPhone(identifierRaw);
  if (id.kind === "invalid" || id.kind === "none") return res.status(400).json({ ok: false, error: "Enter a valid email or phone" });
  if (!/^\d{6}$/.test(otp)) return res.status(400).json({ ok: false, error: "Enter a 6-digit OTP" });

  const key = otpKey(id.kind, id.value);
  const record = otpStore.get(key);
  if (!record) return res.status(400).json({ ok: false, error: "OTP expired or not requested" });
  if (Date.now() > record.expiresAt) {
    otpStore.delete(key);
    return res.status(400).json({ ok: false, error: "OTP expired" });
  }
  if (record.attemptsLeft <= 0) {
    otpStore.delete(key);
    return res.status(429).json({ ok: false, error: "Too many attempts. Please request a new OTP" });
  }

  const ok = await bcrypt.compare(otp, record.otpHash);
  if (!ok) {
    record.attemptsLeft -= 1;
    otpStore.set(key, record);
    return res.status(400).json({ ok: false, error: "Wrong OTP", attemptsLeft: record.attemptsLeft });
  }

  // Create a short-lived reset token, scoped to identifier
  const resetToken = jwt.sign({ kind: id.kind, value: id.value, purpose: "reset" }, JWT_SECRET, { expiresIn: "10m" });
  return res.json({ ok: true, resetToken });
});

app.post("/api/reset-password", async (req, res) => {
  const resetToken = String(req.body?.resetToken || "");
  const password = String(req.body?.password || "");

  if (!resetToken) return res.status(400).json({ ok: false, error: "Missing reset token" });
  const pass = validatePassword(password);
  if (!pass.ok) return res.status(400).json({ ok: false, error: "Password does not meet requirements", rules: pass.rules });

  let payload;
  try {
    payload = jwt.verify(resetToken, JWT_SECRET);
  } catch {
    return res.status(400).json({ ok: false, error: "Reset token expired or invalid" });
  }
  if (payload?.purpose !== "reset" || !payload.kind || !payload.value) return res.status(400).json({ ok: false, error: "Invalid reset token" });

  const db = readUsers();
  const idx = db.users.findIndex((u) => (payload.kind === "email" ? u.email === payload.value : u.phone === payload.value));
  // Don't reveal user existence; respond ok either way
  if (idx >= 0) {
    const passwordHash = await bcrypt.hash(password, 12);
    db.users[idx] = { ...db.users[idx], passwordHash, updatedAt: new Date().toISOString() };
    writeUsers(db);
  }

  // Invalidate OTP record if exists
  otpStore.delete(otpKey(payload.kind, payload.value));

  return res.json({ ok: true });
});

// Products (cloud DB) + Cloudinary (image upload)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
});

app.get("/api/products", async (req, res) => {
  if (!supabase) {
    return res.status(501).json({ ok: false, error: "Database not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." });
  }
  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
  if (error) return res.status(500).json({ ok: false, error: "Failed to fetch products" });
  return res.json({ ok: true, products: data || [] });
});

app.post("/api/products", authMiddleware, adminOnly, async (req, res) => {
  if (!supabase) return res.status(501).json({ ok: false, error: "Database not configured" });
  const { name, price, category, description, image_url, tags } = req.body || {};

  const n = String(name || "").trim();
  const d = String(description || "").trim();
  const c = String(category || "").trim();
  const t = Array.isArray(tags) ? tags : [];
  const p = Number(price);
  const img = String(image_url || "").trim();

  if (!n || !Number.isFinite(p) || p <= 0 || !c || !img) return res.status(400).json({ ok: false, error: "Missing required fields" });

  const { data, error } = await supabase
    .from("products")
    .insert([{ name: n, price: Math.round(p), category: c, tags: t, description: d, image_url: img }])
    .select("*")
    .single();
  if (error) return res.status(500).json({ ok: false, error: "Failed to create product" });
  return res.json({ ok: true, product: data });
});

app.put("/api/products/:id", authMiddleware, adminOnly, async (req, res) => {
  if (!supabase) return res.status(501).json({ ok: false, error: "Database not configured" });
  const id = req.params.id;
  const patch = {};
  if (req.body?.name != null) patch.name = String(req.body.name).trim();
  if (req.body?.price != null) patch.price = Math.round(Number(req.body.price));
  if (req.body?.category != null) patch.category = String(req.body.category).trim();
  if (req.body?.description != null) patch.description = String(req.body.description).trim();
  if (req.body?.image_url != null) patch.image_url = String(req.body.image_url).trim();
  if (req.body?.tags != null) patch.tags = Array.isArray(req.body.tags) ? req.body.tags : [];

  const { data, error } = await supabase.from("products").update(patch).eq("id", id).select("*").single();
  if (error) return res.status(500).json({ ok: false, error: "Failed to update product" });
  return res.json({ ok: true, product: data });
});

app.delete("/api/products/:id", authMiddleware, adminOnly, async (req, res) => {
  if (!supabase) return res.status(501).json({ ok: false, error: "Database not configured" });
  const id = req.params.id;
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return res.status(500).json({ ok: false, error: "Failed to delete product" });
  return res.json({ ok: true });
});

app.post("/api/cloudinary/upload", authMiddleware, adminOnly, upload.single("image"), async (req, res) => {
  if (!CLOUDINARY_ENABLED) {
    return res.status(501).json({ ok: false, error: "Cloudinary not configured. Set CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET." });
  }
  if (!req.file) return res.status(400).json({ ok: false, error: "Missing image file" });

  const folder = "ramya-radha-boutique/products";
  const uploadStream = cloudinary.uploader.upload_stream(
    {
      folder,
      resource_type: "image",
      overwrite: false,
      transformation: [{ width: 1400, crop: "limit" }, { quality: "auto" }, { fetch_format: "auto" }],
    },
    (err, result) => {
      if (err || !result) return res.status(500).json({ ok: false, error: "Image upload failed" });
      return res.json({ ok: true, url: result.secure_url, public_id: result.public_id });
    }
  );
  uploadStream.end(req.file.buffer);
});

// Gallery API to fetch all cloudinary images
app.get("/api/cloudinary/gallery", async (req, res) => {
  if (!CLOUDINARY_ENABLED) {
    return res.status(501).json({ ok: false, error: "Cloudinary not configured" });
  }
  try {
    const result = await cloudinary.search
      .expression('folder:ramya-radha-boutique/products OR folder:fashion-store')
      .sort_by('created_at', 'desc')
      .max_results(30)
      .execute();
    return res.json({ ok: true, images: result.resources.map(r => r.secure_url) });
  } catch (err) {
    console.error("Cloudinary Search Error:", err);
    return res.status(500).json({ ok: false, error: "Failed to fetch gallery" });
  }
});

// Protected example (optional)
app.get("/api/private", authMiddleware, (req, res) => {
  res.json({ ok: true, user: req.user });
});

// === RAZORPAY & ORDERS API ===
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "test",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "test",
});

app.post("/api/create-order", async (req, res) => {
  try {
    const { amount, receipt } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ ok: false, error: "Invalid amount" });

    const options = {
      amount: Math.round(amount * 100), // amount in the smallest currency unit (paise)
      currency: "INR",
      receipt: receipt || crypto.randomBytes(8).toString("hex"),
    };

    const order = await razorpay.orders.create(options);
    res.json({ ok: true, order });
  } catch (error) {
    console.error("Razorpay Create Order Error:", error);
    res.status(500).json({ ok: false, error: "Failed to create order" });
  }
});

app.post("/api/capture-order", async (req, res) => {
  if (!supabase) return res.status(501).json({ ok: false, error: "Database not configured" });

  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      customerDetails,
      items,
      amount
    } = req.body;

    // Verify Signature
    const secret = process.env.RAZORPAY_KEY_SECRET || "test";
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac("sha256", secret).update(body.toString()).digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ ok: false, error: "Invalid signature" });
    }

    // Save to Supabase
    const { name, email, phone, address } = customerDetails || {};
    
    const { data: insertedOrder, error: insertError } = await supabase.from("orders").insert([{
      customer_name: name || "Unknown",
      customer_email: email || "unknown@example.com",
      customer_phone: phone || "0000000000",
      delivery_address: address || {},
      items: items || [],
      amount: amount || 0,
      razorpay_order_id,
      razorpay_payment_id,
      status: "paid"
    }]).select("*").single();

    if (insertError) {
      console.error("Supabase Save Order Error:", insertError);
      return res.status(500).json({ ok: false, error: "Payment successful but failed to save order" });
    }

    res.json({ ok: true, savedOrder: insertedOrder });
  } catch (error) {
    console.error("Capture Order Error:", error);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

app.get("/api/orders", authMiddleware, adminOnly, async (req, res) => {
  if (!supabase) return res.status(501).json({ ok: false, error: "Database not configured" });

  try {
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ ok: true, orders: data || [] });
  } catch (error) {
    res.status(500).json({ ok: false, error: "Failed to fetch orders" });
  }
});

// Expose public .env variables to frontend
app.get("/env-config.js", (req, res) => {
  res.type("application/javascript");
  res.send(`
    window.__ENV__ = {
      NEXT_PUBLIC_EMAILJS_SERVICE_ID: "${process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || ""}",
      NEXT_PUBLIC_EMAILJS_TEMPLATE_ID: "${process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || ""}",
      NEXT_PUBLIC_EMAILJS_PUBLIC_KEY: "${process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || ""}",
      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: "${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || ""}",
      NEXT_PUBLIC_RAZORPAY_KEY_ID: "${process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || ""}"
    };
  `);
});

// Serve frontend
app.use(express.static(__dirname));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

ensureDataFiles();
app.listen(PORT, () => {
  console.log(`Ramya Radha Boutique running on http://localhost:${PORT}`);
  if (JWT_SECRET === "dev-secret-change-me") console.log("⚠️  Set JWT_SECRET in environment for real security.");
  if (!supabase) console.log("ℹ️  Supabase not configured yet (products will not be dynamic).");
  if (!CLOUDINARY_ENABLED) console.log("ℹ️  Cloudinary not configured yet (product image upload will not be cloud).");
});

