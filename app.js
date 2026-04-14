/* Boutique SPA (no backend): products + cart stored in localStorage */

const STORAGE = {
  products: "boutique_products_v1",
  cart: "boutique_cart_v1",
  adminSession: "boutique_admin_session_v1",
};

const ADMIN_PIN = "1234"; // demo PIN; change if you want

const API = {
  signup: "/api/signup",
  login: "/api/login",
  logout: "/api/logout",
  me: "/api/me",
  sendOtp: "/api/send-otp",
  verifyOtp: "/api/verify-otp",
  resetPassword: "/api/reset-password",
};

const AUTH_STORAGE = {
  resetToken: "rrb_reset_token_v1",
  identifier: "rrb_identifier_v1",
  otpExpiresAt: "rrb_otp_expires_at_v1",
};

const PRODUCTS_MODE = {
  source: "local", // "local" | "api"
  ready: false,
};

let productsCache = [];
let productsUnsub = null;

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const CATEGORIES = [
  { key: "new-arrivals", label: "New Arrivals" },
  { key: "dresses", label: "Dresses" },
  { key: "tops", label: "Tops" },
  { key: "ethnic", label: "Ethnic Wear" },
];

const seedProducts = () => [
  {
    id: "p1",
    name: "Satin Wrap Midi Dress",
    price: 1899,
    category: "dresses",
    tags: ["trending", "party"],
    description:
      "A fluid satin wrap dress with a soft sheen and a cinched waist. Designed to drape beautifully and photograph even better.",
    image:
      "https://images.unsplash.com/photo-1520975682071-a2c86bb4e37b?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "p2",
    name: "Ribbed Knit Top (Rose)",
    price: 899,
    category: "tops",
    tags: ["daily", "trending"],
    description:
      "A premium rib-knit top with a clean neckline and a flattering fit. Pair with denim or tailored trousers for a polished look.",
    image:
      "https://images.unsplash.com/photo-1520975958225-35d10439d6ef?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "p3",
    name: "Embroidered Kurta Set",
    price: 2499,
    category: "ethnic",
    tags: ["set", "kurtis", "festive", "trending"],
    description:
      "A graceful kurta set with delicate embroidery and a comfortable silhouette—made for festive days and elegant evenings.",
    image:
      "https://images.unsplash.com/photo-1618354691521-7b8fdb0469a4?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "p5",
    name: "Floral Chiffon Maxi",
    price: 2199,
    category: "dresses",
    tags: ["trending", "summer"],
    description:
      "Lightweight chiffon with a romantic floral print. Floaty movement, soft lining, and an easy waist for all-day comfort.",
    image:
      "https://images.unsplash.com/photo-1520975741121-1058c8d3c0ea?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "p6",
    name: "Co-ord Set (Ivory)",
    price: 2399,
    category: "tops",
    tags: ["trending"],
    description:
      "An elevated set designed for effortless styling—wear it for impact or mix & match for versatility.",
    image:
      "https://images.unsplash.com/photo-1520975914872-3cde7b1c7cbb?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "p7",
    name: "Cotton Poplin Shirt",
    price: 1299,
    category: "tops",
    tags: ["daily", "office"],
    description:
      "Crisp poplin cotton with a clean collar and modern proportions. A boutique take on an everyday essential.",
    image:
      "https://images.unsplash.com/photo-1520975861754-363e87b0dd2a?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "p8",
    name: "Soft Drape Saree",
    price: 2999,
    category: "ethnic",
    tags: ["saree", "festive"],
    description:
      "A soft-drape saree with a subtle lustre—easy to style, comfortable to carry, and made to glow under warm lights.",
    image:
      "https://images.unsplash.com/photo-1618517048288-6e4b18821cc7?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "p9",
    name: "New: Pleated Mini Dress",
    price: 1699,
    category: "new-arrivals",
    tags: ["trending", "new"],
    description:
      "A flattering pleated mini with a structured bodice and airy skirt. Made for brunch dates and city nights.",
    image:
      "https://images.unsplash.com/photo-1520975950400-a7b4d8a5c7c4?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "p10",
    name: "New: Blush Peplum Top",
    price: 1099,
    category: "new-arrivals",
    tags: ["new", "tops"],
    description:
      "A blush peplum top with a refined texture and a soft waist flare—instant polish with minimal effort.",
    image:
      "https://images.unsplash.com/photo-1520975859720-16b8a2d0d2d5?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "p11",
    name: "Textured A-line Dress",
    price: 1999,
    category: "dresses",
    tags: ["daily", "workwear"],
    description:
      "A minimal A-line dress with a boutique textured finish—easy to dress up with heels or down with flats.",
    image:
      "https://images.unsplash.com/photo-1520975916456-9a7e95135406?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "p12",
    name: "Ethnic: Printed Set",
    price: 2299,
    category: "ethnic",
    tags: ["set", "trending"],
    description:
      "A printed ethnic set with a modern color palette and breathable comfort—made for long days and festive vibes.",
    image:
      "https://images.unsplash.com/photo-1618354691514-0d2b96a9623b?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "p13",
    name: "3 Piece Suit Set (Pastel)",
    price: 2899,
    category: "ethnic",
    tags: ["3-piece-suits", "festive", "trending"],
    description:
      "A graceful 3-piece ethnic suit set with a soft pastel mood—made for events, celebrations, and standout styling.",
    image:
      "https://images.unsplash.com/photo-1618354691664-7c67b2f8d5de?auto=format&fit=crop&w=1400&q=80",
  },
];

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}
function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function ensureSeed() {
  const existing = readJSON(STORAGE.products, null);
  if (!existing || !Array.isArray(existing) || existing.length === 0) {
    writeJSON(STORAGE.products, seedProducts());
  }
  const cart = readJSON(STORAGE.cart, null);
  if (!cart || typeof cart !== "object") writeJSON(STORAGE.cart, {});
}

function money(amount) {
  return INR.format(amount || 0);
}

function uid() {
  return "p" + Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function parseRoute() {
  const raw = (location.hash || "#/home").slice(1);
  const [pathPart, queryString = ""] = raw.split("?");
  const parts = pathPart.split("/").filter(Boolean);
  const query = Object.fromEntries(new URLSearchParams(queryString));
  return { parts, query, raw: "#" + raw };
}

function setActiveNav(route) {
  const links = $$(".nav__link[href^='#/']");
  links.forEach((a) => a.classList.remove("nav__link--active"));
  const [a, b] = route.parts;

  let match = null;
  if (!a || a === "home") match = "#/home";
  else if (a === "new-arrivals") match = "#/new-arrivals";
  else if (a === "collections") match = "#/collections";
  else if (a === "about") match = "#/about";
  else if (a === "contact") match = "#/contact";
  else if (a === "category" && b) match = `#/category/${b}`;
  else if (a === "admin") match = null;

  if (match) {
    const el = $(`.nav__link[href='${match}']`);
    if (el) el.classList.add("nav__link--active");
  }
}

function pageTransition(render) {
  const page = $("#page");
  page.style.opacity = "0";
  page.style.transform = "translateY(6px)";
  page.style.transition = "opacity 220ms var(--ease), transform 220ms var(--ease)";
  window.setTimeout(() => {
    render();
    window.requestAnimationFrame(() => {
      page.style.opacity = "1";
      page.style.transform = "translateY(0)";
    });
  }, 120);
}

function revealSetup() {
  const els = $$(".reveal");
  if (els.length === 0) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("reveal--in");
      });
    },
    { threshold: 0.12 }
  );
  els.forEach((el) => io.observe(el));
}

function getProducts() {
  return productsCache;
}
function setProducts(next) {
  // Ignored or can be kept for admin fallback if necessary.
  // Actually, we must update productsCache locally so that renderAdmin updates immediately if we don't await re-fetch.
  productsCache = next;
}

function getCart() {
  return readJSON(STORAGE.cart, {});
}
function setCart(next) {
  writeJSON(STORAGE.cart, next);
  syncCartUI();
}

function cartCount(cart) {
  return Object.values(cart).reduce((sum, n) => sum + (n || 0), 0);
}

function syncCartUI() {
  const cart = getCart();
  $("#cartCount").textContent = String(cartCount(cart));
}

function toast(message) {
  let wrap = $(".toastWrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.className = "toastWrap";
    document.body.appendChild(wrap);
  }
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = `<p>${escapeHTML(message)}</p>`;
  wrap.appendChild(el);
  window.setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translateY(10px)";
    el.style.transition = "opacity 220ms var(--ease), transform 220ms var(--ease)";
  }, 2600);
  window.setTimeout(() => el.remove(), 3100);
}

function escapeHTML(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    credentials: "include",
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Request failed");
  return data;
}

function validatePasswordClient(pw) {
  const s = String(pw || "");
  return {
    min8: s.length >= 8,
    upper: /[A-Z]/.test(s),
    lower: /[a-z]/.test(s),
    number: /\d/.test(s),
    special: /[^A-Za-z0-9]/.test(s),
  };
}

function pwRuleLine(ok, text) {
  return `<li class="${ok ? "ok" : "bad"}">${ok ? "✔" : "✖"} ${escapeHTML(text)}</li>`;
}

function authShellHTML(title, subtitle, bodyHTML) {
  return `
    <div class="container">
      <div class="authWrap reveal">
        <div class="authCard">
          <div class="authCard__head">
            <h1 class="authTitle">${escapeHTML(title)}</h1>
            <p class="authSub">${escapeHTML(subtitle)}</p>
          </div>
          ${bodyHTML}
        </div>
      </div>
    </div>
  `;
}

function setAuthNavHint(user) {
  // Optional: just a toast on login/logout; navbar stays minimal.
  if (user?.name) toast(`Welcome, ${user.name}`);
}

function openOverlay() {
  const o = $("#overlay");
  o.hidden = false;
}
function closeOverlay() {
  const o = $("#overlay");
  o.hidden = true;
}
function syncOverlay() {
  const modalOpen = $("#productModal")?.getAttribute("aria-hidden") === "false";
  const cartOpen = $("#cartDrawer")?.getAttribute("aria-hidden") === "false";
  const navOpen = $("#navMenu")?.classList?.contains("is-open");
  if (modalOpen || cartOpen || navOpen) openOverlay();
  else closeOverlay();
}

function closeNavIfMobile() {
  const menu = $("#navMenu");
  if (menu.classList.contains("is-open")) {
    menu.classList.remove("is-open");
    $("#navBurger").setAttribute("aria-expanded", "false");
    syncOverlay();
  }
}

function openCart() {
  $("#cartDrawer").setAttribute("aria-hidden", "false");
  $("#cartDrawer").classList.add("is-open");
  $("#cartDrawer .drawer__panel").style.transform = "translateX(0)";
  syncOverlay();
  renderCart();
}
function closeCart() {
  $("#cartDrawer").setAttribute("aria-hidden", "true");
  $("#cartDrawer .drawer__panel").style.transform = "translateX(105%)";
  syncOverlay();
}

function openModal(product) {
  const modal = $("#productModal");
  const content = $("#modalContent");
  content.innerHTML = productModalHTML(product);
  modal.style.display = "grid";
  modal.setAttribute("aria-hidden", "false");
  syncOverlay();

  const img = $("#modalImg");
  const media = $("#modalMedia");
  const zoom = { x: 0.5, y: 0.5, on: false };
  const applyZoom = () => {
    if (!zoom.on) {
      img.style.transform = "scale(1.02)";
      img.style.transformOrigin = "50% 50%";
      return;
    }
    img.style.transform = "scale(1.35)";
    img.style.transformOrigin = `${zoom.x * 100}% ${zoom.y * 100}%`;
  };

  media.addEventListener("mouseenter", () => {
    zoom.on = true;
    applyZoom();
  });
  media.addEventListener("mouseleave", () => {
    zoom.on = false;
    applyZoom();
  });
  media.addEventListener("mousemove", (e) => {
    const rect = media.getBoundingClientRect();
    zoom.x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    zoom.y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    applyZoom();
  });

  $("#modalAddBtn").addEventListener("click", () => {
    addToCart(product.id, 1);
    toast("Added to cart");
  });

  $("#modalBuyBtn").addEventListener("click", () => {
    addToCart(product.id, 1);
    openCart();
  });
}

function closeModal() {
  const modal = $("#productModal");
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
  syncOverlay();
}

function productModalHTML(p) {
  const catLabel = CATEGORIES.find((c) => c.key === p.category)?.label || "Women";
  const tags = Array.isArray(p.tags) ? p.tags.slice(0, 3) : [];
  return `
    <div class="modal__media" id="modalMedia">
      <img id="modalImg" src="${escapeHTML(p.image)}" alt="${escapeHTML(p.name)}" />
      <div class="zoomHint">Hover to zoom</div>
    </div>
    <div class="modal__info">
      <p class="muted" style="margin:0">${escapeHTML(catLabel)}</p>
      <h2 class="modal__title">${escapeHTML(p.name)}</h2>
      <p class="modal__price">${money(p.price)}</p>
      <p class="modal__desc">${escapeHTML(p.description || "A boutique staple designed to flatter and last.")}</p>

      <div class="kv">
        <div class="kv__box">
          <div class="kv__label">Delivery</div>
          <div class="kv__value">2–5 business days</div>
        </div>
        <div class="kv__box">
          <div class="kv__label">Return</div>
          <div class="kv__value">Easy 7-day return</div>
        </div>
      </div>

      ${
        tags.length
          ? `<p class="muted" style="margin:0 0 12px">Tags: ${tags
              .map((t) => `<span class="card__chip" style="position:static; display:inline-block; margin-right:8px">${escapeHTML(t)}</span>`)
              .join("")}</p>`
          : ""
      }

      <div class="modal__actions">
        <button class="btn btn--dark" id="modalAddBtn" type="button">Add to cart</button>
        <button class="btn btn--ghost" id="modalBuyBtn" type="button">Buy now</button>
      </div>
      <p class="note">Tip: Use the search bar for quick finds.</p>
    </div>
  `;
}

function addToCart(productId, qty = 1) {
  const cart = getCart();
  const next = { ...cart, [productId]: (cart[productId] || 0) + qty };
  if (next[productId] <= 0) delete next[productId];
  setCart(next);
}

function renderCart() {
  const cart = getCart();
  const products = getProducts();
  const itemsEl = $("#cartItems");
  const entries = Object.entries(cart).filter(([, q]) => q > 0);

  if (entries.length === 0) {
    itemsEl.innerHTML = `<div class="empty">Your cart is empty. Add something you love.</div>`;
    $("#cartSubtotal").textContent = money(0);
    return;
  }

  let subtotal = 0;
  itemsEl.innerHTML = entries
    .map(([id, qty]) => {
      const p = products.find((x) => x.id === id);
      if (!p) return "";
      subtotal += (p.price || 0) * qty;
      return `
        <div class="cartItem" data-id="${escapeHTML(id)}">
          <img class="cartItem__img" src="${escapeHTML(p.image)}" alt="${escapeHTML(p.name)}" />
          <div>
            <p class="cartItem__name">${escapeHTML(p.name)}</p>
            <p class="cartItem__price">${money(p.price)} • <span class="muted">${escapeHTML(
              CATEGORIES.find((c) => c.key === p.category)?.label || "Women"
            )}</span></p>
          </div>
          <div class="qty" aria-label="Quantity controls">
            <button type="button" data-act="dec" aria-label="Decrease quantity">−</button>
            <span>${qty}</span>
            <button type="button" data-act="inc" aria-label="Increase quantity">+</button>
          </div>
        </div>
      `;
    })
    .join("");

  $("#cartSubtotal").textContent = money(subtotal);

  $$(".cartItem .qty button", itemsEl).forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".cartItem");
      const id = card?.dataset?.id;
      const act = btn.dataset.act;
      if (!id) return;
      addToCart(id, act === "inc" ? 1 : -1);
      renderCart();
    });
  });
}

function cardHTML(p) {
  const chip = (p.tags || []).includes("new") || p.category === "new-arrivals" ? "New" : (p.tags || []).includes("trending") ? "Trending" : "";
  return `
    <article class="card reveal" data-id="${escapeHTML(p.id)}">
      <div class="card__media">
        ${chip ? `<div class="card__chip">${chip}</div>` : ""}
        <img class="card__img" src="${escapeHTML(p.image)}" alt="${escapeHTML(p.name)}" loading="lazy" />
      </div>
      <div class="card__body">
        <p class="card__name">${escapeHTML(p.name)}</p>
        <div class="card__meta">
          <span class="price">${money(p.price)}</span>
          <button class="iconBtn" type="button" aria-label="Add to cart">＋</button>
        </div>
        <p class="muted" style="margin:10px 0 0">${escapeHTML(
          CATEGORIES.find((c) => c.key === p.category)?.label || "Women"
        )}</p>
      </div>
    </article>
  `;
}

function bindCards(root = document) {
  $$(".card", root).forEach((card) => {
    const id = card.dataset.id;
    const p = getProducts().find((x) => x.id === id);
    if (!p) return;

    const img = $(".card__img", card);
    img.addEventListener("click", () => openModal(p));

    const addBtn = $(".iconBtn", card);
    addBtn.addEventListener("click", () => {
      addToCart(p.id, 1);
      toast("Added to cart");
    });
  });
}

async function createProductCloud(payload) {
  const body = {
    name: payload.name,
    price: payload.price,
    category: payload.category,
    tags: payload.tags,
    description: payload.description,
    image_url: payload.image_url,
  };
  const data = await apiFetch("/api/products", { method: "POST", body: JSON.stringify(body) });
  return data.product;
}

async function updateProductCloud(id, patch) {
  const data = await apiFetch(`/api/products/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(patch) });
  return data.product;
}

async function deleteProductCloud(id) {
  await apiFetch(`/api/products/${encodeURIComponent(id)}`, { method: "DELETE" });
}

async function uploadImageCloud(file) {
  const fd = new FormData();
  fd.append("image", file);
  const res = await fetch("/api/cloudinary/upload", { method: "POST", credentials: "include", body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Image upload failed");
  return data.url;
}

function renderHome() {
  const products = getProducts();
  const featured = products.filter((p) => ["dresses", "tops", "ethnic"].includes(p.category)).slice(0, 8);
  const trending = products.filter((p) => (p.tags || []).includes("trending")).slice(0, 8);

  $("#page").innerHTML = `
    <div class="container">
      <section class="hero reveal">
        <div class="hero__grid">
          <div class="hero__copy">
            <p class="hero__eyebrow">Women’s Fashion Boutique</p>
            <h1 class="hero__title">Premium silhouettes, soft palettes, effortless confidence.</h1>
            <p class="hero__sub">
              Curated edits by Ramya Radha Boutique—dresses, tops, and ethnic sets designed for your everyday glow.
            </p>
            <div class="hero__actions">
              <a class="btn btn--dark" href="#/new-arrivals">Shop New Arrivals</a>
              <a class="btn btn--ghost" href="#/collections">Explore Collections</a>
            </div>
          </div>
          <div class="hero__media" aria-hidden="true">
            <img
              class="hero__img"
              src="https://images.unsplash.com/photo-1520975682071-a2c86bb4e37b?auto=format&fit=crop&w=1800&q=80"
              alt=""
            />
            <div class="hero__shade"></div>
            <div class="hero__badge">
              <strong>Style Edit</strong>
              <span>New season • Boutique picks</span>
            </div>
          </div>
        </div>
      </section>

      <section class="section reveal">
        <div class="section__head">
          <div>
            <h2 class="section__title">A brand made for her</h2>
            <p class="section__desc">
              Ramya Radha Boutique is a women-only fashion boutique—minimal, premium, and designed to make outfits feel elevated without feeling overdone.
            </p>
          </div>
        </div>
        <div class="featureGrid">
          <div class="feature reveal">
            <div class="feature__kicker">Premium</div>
            <p class="feature__title">Boutique-grade finish</p>
            <p class="feature__text">Clean tailoring, elevated textures, and styles that look expensive—because they should.</p>
          </div>
          <div class="feature reveal">
            <div class="feature__kicker">Curated</div>
            <p class="feature__title">Edits, not endless aisles</p>
            <p class="feature__text">Every item is chosen to match a refined wardrobe—from daywear to festive nights.</p>
          </div>
          <div class="feature reveal">
            <div class="feature__kicker">Easy</div>
            <p class="feature__title">Fast add-to-cart flow</p>
            <p class="feature__text">Quick view, smooth navigation, and responsive layouts built for mobile-first shoppers.</p>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="section__head reveal">
          <div>
            <h2 class="section__title">Featured collection</h2>
            <p class="section__desc">Boutique favorites that match the season’s soft, elegant mood.</p>
          </div>
          <a class="btn" href="#/collections">View all</a>
        </div>
        <div class="grid" id="featuredGrid">
          ${featured.map(cardHTML).join("")}
        </div>
      </section>

      <section class="section">
        <div class="section__head reveal">
          <div>
            <h2 class="section__title">Trending now</h2>
            <p class="section__desc">Most-loved styles—updated weekly with new drops.</p>
          </div>
          <a class="btn" href="#/new-arrivals">Shop trends</a>
        </div>
        <div class="grid" id="trendingGrid">
          ${trending.map(cardHTML).join("")}
        </div>
      </section>

      <section class="banner reveal">
        <div class="banner__copy">
          <h3 class="banner__title">Festive-ready, boutique-finished.</h3>
          <p class="banner__text">Explore elegant ethnic edits—from kurtis to 3 piece suits—in soft premium tones.</p>
          <a class="btn btn--dark" href="#/category/ethnic">Shop Ethnic Wear</a>
        </div>
        <div class="banner__media" aria-hidden="true">
          <img src="https://images.unsplash.com/photo-1618517048288-6e4b18821cc7?auto=format&fit=crop&w=1800&q=80" alt="" />
        </div>
      </section>
    </div>
  `;

  bindCards($("#page"));
  revealSetup();
}

async function initProductsCloud() {
  // Try API first; if not configured/available, keep localStorage flow.
  try {
    const data = await apiFetch("/api/products");
    productsCache = Array.isArray(data.products) ? data.products.map(mapDbProductToUi) : [];
    PRODUCTS_MODE.source = "api";
    PRODUCTS_MODE.ready = true;
    setupProductsRealtimeIfPossible();
  } catch {
    PRODUCTS_MODE.source = "local";
    PRODUCTS_MODE.ready = true;
  }
}

function mapDbProductToUi(p) {
  // DB columns: id, name, price, category, description, image_url, created_at
  return {
    id: String(p.id),
    name: p.name,
    price: Number(p.price),
    category: p.category,
    tags: Array.isArray(p.tags) ? p.tags : [],
    description: p.description || "",
    image: p.image_url,
    createdAt: p.created_at || null,
  };
}

function setupProductsRealtimeIfPossible() {
  const cfg = window.__SUPABASE__ || {};
  const supaGlobal = window.supabase;
  if (!supaGlobal || !cfg.url || !cfg.anonKey || !cfg.productsTable) return;

  try {
    const client = supaGlobal.createClient(cfg.url, cfg.anonKey);
    if (productsUnsub) productsUnsub();

    const channel = client
      .channel("rrb-products")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: cfg.productsTable },
        async () => {
          try {
            const data = await apiFetch("/api/products");
            productsCache = Array.isArray(data.products) ? data.products.map(mapDbProductToUi) : [];
            refreshVisibleProducts();
          } catch {
            // ignore
          }
        }
      )
      .subscribe();

    productsUnsub = () => client.removeChannel(channel);
  } catch {
    // ignore realtime setup
  }
}

function refreshVisibleProducts() {
  // Re-render current route so grids update, without changing any UI structure.
  renderRoute();
}

function renderCollections() {
  $("#page").innerHTML = `
    <div class="container">
      <section class="section reveal">
        <div class="section__head">
          <div>
            <h1 class="section__title" style="font-size:30px">Collections</h1>
            <p class="section__desc">Choose a category to browse. Use search to find exactly what you want.</p>
          </div>
        </div>
        <div class="pillRow">
          ${CATEGORIES.map((c) => `<a class="pill" href="${c.key === "new-arrivals" ? "#/new-arrivals" : `#/category/${c.key}`}">${escapeHTML(c.label)}</a>`).join("")}
        </div>
      </section>

      <section class="section reveal">
        <div class="section__head">
          <div>
            <h2 class="section__title">Boutique edit</h2>
            <p class="section__desc">A quick browse across the entire store.</p>
          </div>
        </div>
        <div class="grid" id="allGrid"></div>
      </section>
    </div>
  `;

  const products = getProducts().slice().reverse();
  $("#allGrid").innerHTML = products.map(cardHTML).join("");
  bindCards($("#page"));
  revealSetup();
}

function renderCategory(categoryKey, query) {
  const catLabel = CATEGORIES.find((c) => c.key === categoryKey)?.label || "Women";
  const tag = query.tag ? String(query.tag).toLowerCase() : "";

  const products = getProducts().filter((p) => p.category === categoryKey);
  const uniqueTags = Array.from(
    new Set(products.flatMap((p) => (Array.isArray(p.tags) ? p.tags : [])).map((t) => String(t).toLowerCase()))
  ).slice(0, 10);

  let filtered = products;
  if (tag) filtered = filtered.filter((p) => (p.tags || []).map((t) => String(t).toLowerCase()).includes(tag));
  const search = getSearchTerm();
  if (search) filtered = filtered.filter((p) => `${p.name} ${p.description}`.toLowerCase().includes(search));

  $("#page").innerHTML = `
    <div class="container">
      <section class="section reveal">
        <div class="section__head">
          <div>
            <h1 class="section__title" style="font-size:30px">${escapeHTML(catLabel)}</h1>
            <p class="section__desc">Refined fits, elegant tones, and modern details—built for women.</p>
          </div>
        </div>
        <div class="pillRow" id="tagPills">
          <a class="pill ${tag ? "" : "pill--active"}" href="#/category/${escapeHTML(categoryKey)}">All</a>
          ${uniqueTags
            .map(
              (t) =>
                `<a class="pill ${tag === t ? "pill--active" : ""}" href="#/category/${escapeHTML(categoryKey)}?tag=${encodeURIComponent(t)}">${escapeHTML(t)}</a>`
            )
            .join("")}
        </div>
      </section>

      <section class="section">
        <div class="section__head reveal">
          <div>
            <h2 class="section__title">Products</h2>
            <p class="section__desc">${filtered.length} item(s) found.</p>
          </div>
          <a class="btn" href="#/collections">All collections</a>
        </div>
        <div class="grid" id="catGrid"></div>
      </section>
    </div>
  `;

  $("#catGrid").innerHTML = filtered.length ? filtered.map(cardHTML).join("") : `<div class="empty">No products found. Try another tag or search.</div>`;
  bindCards($("#page"));
  revealSetup();
}

function renderNewArrivals(query) {
  const search = getSearchTerm();
  let products = getProducts().filter((p) => p.category === "new-arrivals" || (p.tags || []).includes("new"));
  if (search) products = products.filter((p) => `${p.name} ${p.description}`.toLowerCase().includes(search));

  const filters = [
    { id: "all", label: "All" },
    { id: "trending", label: "Trending" },
    { id: "dresses", label: "Dresses" },
    { id: "tops", label: "Tops" },
    { id: "ethnic", label: "Ethnic" },
  ];

  const active = query.f || "all";
  let filtered = products;
  if (active === "trending") filtered = products.filter((p) => (p.tags || []).includes("trending"));
  if (["dresses", "tops", "ethnic"].includes(active)) filtered = getProducts().filter((p) => p.category === active).slice(0, 12);

  $("#page").innerHTML = `
    <div class="container">
      <section class="section reveal">
        <div class="section__head">
          <div>
            <h1 class="section__title" style="font-size:30px">New Arrivals</h1>
            <p class="section__desc">Fresh edits—new, trending, and boutique-picked for women.</p>
          </div>
        </div>
        <div class="pillRow">
          ${filters
            .map(
              (x) =>
                `<a class="pill ${active === x.id ? "pill--active" : ""}" href="#/new-arrivals?f=${encodeURIComponent(
                  x.id
                )}">${escapeHTML(x.label)}</a>`
            )
            .join("")}
        </div>
      </section>

      <section class="section">
        <div class="section__head reveal">
          <div>
            <h2 class="section__title">Just dropped</h2>
            <p class="section__desc">${filtered.length} item(s).</p>
          </div>
          <a class="btn" href="#/collections">Browse all</a>
        </div>
        <div class="grid" id="naGrid"></div>
      </section>
    </div>
  `;

  $("#naGrid").innerHTML = filtered.length ? filtered.map(cardHTML).join("") : `<div class="empty">No items found.</div>`;
  bindCards($("#page"));
  revealSetup();
}

function renderAbout() {
  $("#page").innerHTML = `
    <div class="container">
      <section class="section reveal">
        <div class="section__head">
          <div>
            <h1 class="section__title" style="font-size:30px">About Ramya Radha Boutique</h1>
            <p class="section__desc">A women-only boutique, inspired by modern fashion retail and built for a premium experience.</p>
          </div>
        </div>

        <div class="featureGrid">
          <div class="feature reveal">
            <div class="feature__kicker">Our vibe</div>
            <p class="feature__title">Premium, minimal, feminine</p>
            <p class="feature__text">Soft backgrounds, clear product visibility, and boutique detailing with smooth micro-interactions.</p>
          </div>
          <div class="feature reveal">
            <div class="feature__kicker">Our promise</div>
            <p class="feature__title">Style you’ll re-wear</p>
            <p class="feature__text">Versatile edits across dresses, tops, and ethnic sets designed for real-life wardrobes.</p>
          </div>
          <div class="feature reveal">
            <div class="feature__kicker">Built for</div>
            <p class="feature__title">Mobile-first shopping</p>
            <p class="feature__text">Fast loading, responsive layout, and a simple cart experience—easy browsing on every device.</p>
          </div>
        </div>
      </section>
    </div>
  `;
  revealSetup();
}

function renderContact() {
  $("#page").innerHTML = `
    <div class="container">
      <section class="section reveal">
        <div class="section__head">
          <div>
            <h1 class="section__title" style="font-size:30px">Contact</h1>
            <p class="section__desc">Questions, bulk orders, or styling help? We’d love to hear from you.</p>
          </div>
        </div>

        <form class="form reveal" id="contactForm">
          <div class="form__grid">
            <div class="field">
              <label for="cName">Name</label>
              <input id="cName" required placeholder="Your name" />
            </div>
            <div class="field">
              <label for="cEmail">Email</label>
              <input id="cEmail" type="email" required placeholder="you@example.com" />
            </div>
          </div>
          <div class="field" style="margin-top:12px">
            <label for="cMsg">Message</label>
            <textarea id="cMsg" required placeholder="Tell us what you’re looking for..."></textarea>
          </div>
          <div class="form__actions">
            <button class="btn btn--dark" id="contactSend" type="submit">Send Message</button>
            <a class="btn btn--ghost" href="#/home">Back to home</a>
          </div>
          <p class="note" id="contactNote">We'll get back to you soon.</p>
        </form>
      </section>
    </div>
  `;

  $("#contactForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = $("#contactSend");
    const name = $("#cName").value;
    const email = $("#cEmail").value;
    const msg = $("#cMsg").value;

    btn.textContent = "Sending...";
    btn.disabled = true;

    const env = window.__ENV__ || {};
    const serviceID = env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateID = env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (!publicKey || !serviceID || !templateID) {
      console.warn("EmailJS credentials missing. Check .env variables.");
      toast("Success (Demo): " + msg.slice(0, 20) + "...");
      $("#contactForm").reset();
      btn.textContent = "Send Message";
      btn.disabled = false;
      return;
    }

    emailjs.init(publicKey);
    const templateParams = { from_name: name, reply_to: email, message: msg };
    
    emailjs.send(serviceID, templateID, templateParams)
      .then(() => {
        toast("Email sent successfully!");
        $("#contactForm").reset();
      })
      .catch((err) => {
        console.error("EmailJS Error:", err);
        toast("Failed to send email. Check console.");
      })
      .finally(() => {
        btn.textContent = "Send Message";
        btn.disabled = false;
      });
  });
  revealSetup();
}

function renderLogin() {
  $("#page").innerHTML = authShellHTML(
    "Login",
    "Sign in to Ramya Radha Boutique using your email or phone number.",
    `
      <div id="authAlert"></div>
      <form class="authForm" id="loginForm">
        <div class="field">
          <label for="identifier">Email or Phone Number</label>
          <div class="input">
            <input id="identifier" autocomplete="username" placeholder="you@example.com or 9897786811" required />
          </div>
        </div>

        <div class="field">
          <label for="password">Password</label>
          <div class="input">
            <input id="password" type="password" autocomplete="current-password" placeholder="Enter password" required />
            <button class="inputBtn" id="togglePw" type="button">Show</button>
          </div>
        </div>

        <div class="row">
          <label class="check"><input id="remember" type="checkbox" /> Remember me</label>
          <a class="link" href="#/forgot">Forgot Password?</a>
        </div>

        <button class="btn btn--dark btn--full" id="loginBtn" type="submit">
          <span id="loginBtnText">Login</span>
          <span id="loginSpin" class="spinner" style="display:none" aria-hidden="true"></span>
        </button>

        <p class="help">New here? <a class="link" href="#/signup">Create Account</a></p>
      </form>
    `
  );

  const pw = $("#password");
  $("#togglePw").addEventListener("click", () => {
    const on = pw.type === "password";
    pw.type = on ? "text" : "password";
    $("#togglePw").textContent = on ? "Hide" : "Show";
  });

  $("#loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    setAuthAlert("");
    setLoading(true, "login");
    try {
      const identifier = $("#identifier").value.trim();
      const password = $("#password").value;
      const remember = $("#remember").checked;
      const data = await apiFetch(API.login, { method: "POST", body: JSON.stringify({ identifier, password, remember }) });
      setAuthNavHint(data.user);
      toast("Logged in successfully");
      location.hash = "#/home";
    } catch (err) {
      setAuthAlert(err.message || "Login failed");
    } finally {
      setLoading(false, "login");
    }
  });

  revealSetup();
}

function renderSignup() {
  $("#page").innerHTML = authShellHTML(
    "Create account",
    "Join Ramya Radha Boutique for faster checkout and order support.",
    `
      <div id="authAlert"></div>
      <form class="authForm" id="signupForm">
        <div class="field">
          <label for="name">Full Name</label>
          <div class="input"><input id="name" autocomplete="name" placeholder="Your full name" required /></div>
        </div>

        <div class="field">
          <label for="email">Email ID</label>
          <div class="input"><input id="email" type="email" autocomplete="email" placeholder="you@example.com" required /></div>
        </div>

        <div class="field">
          <label for="phone">Phone Number</label>
          <div class="input"><input id="phone" inputmode="numeric" autocomplete="tel" placeholder="10-digit phone" required /></div>
        </div>

        <div class="field">
          <label for="pw1">Password</label>
          <div class="input">
            <input id="pw1" type="password" autocomplete="new-password" placeholder="Create a strong password" required />
            <button class="inputBtn" id="togglePw1" type="button">Show</button>
          </div>
        </div>

        <div class="pwRules" id="pwRules">
          <p class="pwRules__title">Password must include</p>
          <ul id="pwRulesList"></ul>
        </div>

        <div class="field">
          <label for="pw2">Confirm Password</label>
          <div class="input">
            <input id="pw2" type="password" autocomplete="new-password" placeholder="Confirm password" required />
            <button class="inputBtn" id="togglePw2" type="button">Show</button>
          </div>
        </div>

        <button class="btn btn--dark btn--full" id="signupBtn" type="submit">
          <span id="signupBtnText">Sign up</span>
          <span id="signupSpin" class="spinner" style="display:none" aria-hidden="true"></span>
        </button>

        <p class="help">Already have an account? <a class="link" href="#/login">Login</a></p>
      </form>
    `
  );

  const pw1 = $("#pw1");
  const pw2 = $("#pw2");
  const renderRules = () => {
    const r = validatePasswordClient(pw1.value);
    $("#pwRulesList").innerHTML = [
      pwRuleLine(r.min8, "Minimum 8 characters"),
      pwRuleLine(r.upper, "At least 1 uppercase letter"),
      pwRuleLine(r.lower, "At least 1 lowercase letter"),
      pwRuleLine(r.number, "At least 1 number"),
      pwRuleLine(r.special, "At least 1 special character"),
    ].join("");
  };
  renderRules();
  pw1.addEventListener("input", renderRules);

  const toggle = (inputId, btnId) => {
    const input = $(inputId);
    const btn = $(btnId);
    btn.addEventListener("click", () => {
      const on = input.type === "password";
      input.type = on ? "text" : "password";
      btn.textContent = on ? "Hide" : "Show";
    });
  };
  toggle("#pw1", "#togglePw1");
  toggle("#pw2", "#togglePw2");

  $("#signupForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    setAuthAlert("");
    const rules = validatePasswordClient(pw1.value);
    const ok = Object.values(rules).every(Boolean);
    if (!ok) return setAuthAlert("Password does not meet the requirements.");
    if (pw1.value !== pw2.value) return setAuthAlert("Passwords do not match.");

    setLoading(true, "signup");
    try {
      const name = $("#name").value.trim();
      const email = $("#email").value.trim();
      const phone = $("#phone").value.trim();
      const password = pw1.value;
      const data = await apiFetch(API.signup, { method: "POST", body: JSON.stringify({ name, email, phone, password }) });
      setAuthNavHint(data.user);
      toast("Account created");
      location.hash = "#/home";
    } catch (err) {
      setAuthAlert(err.message || "Signup failed");
    } finally {
      setLoading(false, "signup");
    }
  });

  revealSetup();
}

function renderForgot() {
  $("#page").innerHTML = authShellHTML(
    "Forgot password",
    "Enter your email or phone number. Choose how you want to receive the OTP.",
    `
      <div id="authAlert"></div>
      <form class="authForm" id="forgotForm">
        <div class="field">
          <label for="fpId">Email or Phone Number</label>
          <div class="input">
            <input id="fpId" placeholder="you@example.com or 9897786811" required />
          </div>
        </div>

        <div class="field">
          <label>Send OTP via</label>
          <div class="row">
            <label class="check"><input type="radio" name="chan" value="email" checked /> Email</label>
            <label class="check"><input type="radio" name="chan" value="sms" /> SMS</label>
          </div>
        </div>

        <button class="btn btn--dark btn--full" id="sendOtpBtn" type="submit">
          <span id="sendOtpText">Send OTP</span>
          <span id="sendOtpSpin" class="spinner" style="display:none" aria-hidden="true"></span>
        </button>

        <p class="help"><a class="link" href="#/login">Back to login</a></p>
      </form>
    `
  );

  $("#forgotForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    setAuthAlert("");
    setLoading(true, "sendOtp");
    try {
      const identifier = $("#fpId").value.trim();
      const channel = $$("input[name='chan']").find((x) => x.checked)?.value || "email";
      const data = await apiFetch(API.sendOtp, { method: "POST", body: JSON.stringify({ identifier, channel }) });
      localStorage.setItem(AUTH_STORAGE.identifier, identifier);
      localStorage.setItem(AUTH_STORAGE.otpExpiresAt, String(Date.now() + (data.expiresInSec || 180) * 1000));
      if (data.devOtp) toast(`DEV OTP: ${data.devOtp}`);
      toast(`OTP sent to ${data.masked}`);
      location.hash = "#/verify-otp";
    } catch (err) {
      setAuthAlert(err.message || "Could not send OTP");
    } finally {
      setLoading(false, "sendOtp");
    }
  });

  revealSetup();
}

function renderVerifyOtp() {
  const identifier = localStorage.getItem(AUTH_STORAGE.identifier) || "";
  const expiresAt = Number(localStorage.getItem(AUTH_STORAGE.otpExpiresAt) || "0");

  $("#page").innerHTML = authShellHTML(
    "Verify OTP",
    "Enter the 6-digit OTP. It expires in a few minutes.",
    `
      <div id="authAlert"></div>
      <form class="authForm" id="otpForm">
        <div class="field">
          <label for="otpId">Email or Phone Number</label>
          <div class="input"><input id="otpId" value="${escapeHTML(identifier)}" placeholder="you@example.com or 9897786811" required /></div>
        </div>

        <div class="field">
          <label for="otp">OTP</label>
          <div class="otpRow">
            <div class="input"><input id="otp" class="otpInput" inputmode="numeric" placeholder="••••••" required /></div>
            <button class="btn" id="resendBtn" type="button">Resend</button>
          </div>
          <p class="help">Time left: <strong id="otpTimer">--:--</strong></p>
        </div>

        <button class="btn btn--dark btn--full" id="verifyBtn" type="submit">
          <span id="verifyText">Verify</span>
          <span id="verifySpin" class="spinner" style="display:none" aria-hidden="true"></span>
        </button>
      </form>
    `
  );

  const timerEl = $("#otpTimer");
  const tick = () => {
    const left = Math.max(0, expiresAt - Date.now());
    const s = Math.floor(left / 1000);
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    timerEl.textContent = `${mm}:${ss}`;
    if (left <= 0) setAuthAlert("OTP expired. Please resend OTP.");
  };
  tick();
  const t = window.setInterval(tick, 1000);

  $("#resendBtn").addEventListener("click", async () => {
    setAuthAlert("");
    setLoading(true, "sendOtp");
    try {
      const id = $("#otpId").value.trim();
      const data = await apiFetch(API.sendOtp, { method: "POST", body: JSON.stringify({ identifier: id, channel: "email" }) });
      localStorage.setItem(AUTH_STORAGE.identifier, id);
      localStorage.setItem(AUTH_STORAGE.otpExpiresAt, String(Date.now() + (data.expiresInSec || 180) * 1000));
      if (data.devOtp) toast(`DEV OTP: ${data.devOtp}`);
      toast("OTP resent");
    } catch (err) {
      setAuthAlert(err.message || "Could not resend OTP");
    } finally {
      setLoading(false, "sendOtp");
    }
  });

  $("#otpForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    setAuthAlert("");
    setLoading(true, "verify");
    try {
      const id = $("#otpId").value.trim();
      const otp = $("#otp").value.trim().replace(/\s+/g, "");
      const data = await apiFetch(API.verifyOtp, { method: "POST", body: JSON.stringify({ identifier: id, otp }) });
      localStorage.setItem(AUTH_STORAGE.resetToken, data.resetToken);
      localStorage.setItem(AUTH_STORAGE.identifier, id);
      toast("OTP verified");
      location.hash = "#/reset-password";
    } catch (err) {
      setAuthAlert(err.message || "OTP verification failed");
    } finally {
      setLoading(false, "verify");
      window.clearInterval(t);
    }
  });

  revealSetup();
}

function renderResetPassword() {
  $("#page").innerHTML = authShellHTML(
    "Reset password",
    "Set a new password for your account. Make it strong and unique.",
    `
      <div id="authAlert"></div>
      <form class="authForm" id="resetForm">
        <div class="field">
          <label for="rp1">New password</label>
          <div class="input">
            <input id="rp1" type="password" autocomplete="new-password" placeholder="New password" required />
            <button class="inputBtn" id="toggleRp1" type="button">Show</button>
          </div>
        </div>

        <div class="pwRules" id="rpRules">
          <p class="pwRules__title">Password must include</p>
          <ul id="rpRulesList"></ul>
        </div>

        <div class="field">
          <label for="rp2">Confirm password</label>
          <div class="input">
            <input id="rp2" type="password" autocomplete="new-password" placeholder="Confirm password" required />
            <button class="inputBtn" id="toggleRp2" type="button">Show</button>
          </div>
        </div>

        <button class="btn btn--dark btn--full" id="resetBtn" type="submit">
          <span id="resetText">Reset password</span>
          <span id="resetSpin" class="spinner" style="display:none" aria-hidden="true"></span>
        </button>

        <p class="help"><a class="link" href="#/login">Back to login</a></p>
      </form>
    `
  );

  const rp1 = $("#rp1");
  const rp2 = $("#rp2");
  const renderRules = () => {
    const r = validatePasswordClient(rp1.value);
    $("#rpRulesList").innerHTML = [
      pwRuleLine(r.min8, "Minimum 8 characters"),
      pwRuleLine(r.upper, "At least 1 uppercase letter"),
      pwRuleLine(r.lower, "At least 1 lowercase letter"),
      pwRuleLine(r.number, "At least 1 number"),
      pwRuleLine(r.special, "At least 1 special character"),
    ].join("");
  };
  renderRules();
  rp1.addEventListener("input", renderRules);

  const toggle = (input, btn) => {
    btn.addEventListener("click", () => {
      const on = input.type === "password";
      input.type = on ? "text" : "password";
      btn.textContent = on ? "Hide" : "Show";
    });
  };
  toggle(rp1, $("#toggleRp1"));
  toggle(rp2, $("#toggleRp2"));

  $("#resetForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    setAuthAlert("");
    const rules = validatePasswordClient(rp1.value);
    const ok = Object.values(rules).every(Boolean);
    if (!ok) return setAuthAlert("Password does not meet the requirements.");
    if (rp1.value !== rp2.value) return setAuthAlert("Passwords do not match.");

    const resetToken = localStorage.getItem(AUTH_STORAGE.resetToken) || "";
    if (!resetToken) return setAuthAlert("Reset session expired. Please request OTP again.");

    setLoading(true, "reset");
    try {
      await apiFetch(API.resetPassword, { method: "POST", body: JSON.stringify({ resetToken, password: rp1.value }) });
      localStorage.removeItem(AUTH_STORAGE.resetToken);
      localStorage.removeItem(AUTH_STORAGE.otpExpiresAt);
      toast("Password reset successfully");
      setAuthAlert("Password updated. Please log in with your new password.", true);
      window.setTimeout(() => (location.hash = "#/login"), 900);
    } catch (err) {
      setAuthAlert(err.message || "Reset failed");
    } finally {
      setLoading(false, "reset");
    }
  });

  revealSetup();
}

function setAuthAlert(message, ok = false) {
  const el = $("#authAlert");
  if (!el) return;
  if (!message) {
    el.innerHTML = "";
    return;
  }
  el.innerHTML = `<div class="alert ${ok ? "alert--ok" : ""}">${escapeHTML(message)}</div>`;
}

function setLoading(on, kind) {
  const map = {
    login: ["#loginBtnText", "#loginSpin"],
    signup: ["#signupBtnText", "#signupSpin"],
    sendOtp: ["#sendOtpText", "#sendOtpSpin"],
    verify: ["#verifyText", "#verifySpin"],
    reset: ["#resetText", "#resetSpin"],
  };
  const ids = map[kind];
  if (!ids) return;
  const [textId, spinId] = ids;
  const t = $(textId);
  const s = $(spinId);
  if (t) t.style.opacity = on ? "0.8" : "1";
  if (s) s.style.display = on ? "inline-block" : "none";
}

function isAdminSession() {
  return readJSON(STORAGE.adminSession, { ok: false })?.ok === true;
}
function setAdminSession(ok) {
  writeJSON(STORAGE.adminSession, { ok: !!ok, ts: Date.now() });
}

function renderAdmin() {
  const ok = isAdminSession();
  if (!ok) {
    $("#page").innerHTML = `
      <div class="container">
        <section class="section reveal">
          <div class="section__head">
            <div>
              <h1 class="section__title" style="font-size:30px">Admin</h1>
              <p class="section__desc">Enter the PIN to manage products (local demo admin).</p>
            </div>
          </div>

          <div class="form reveal">
            <div class="field">
              <label for="pin">Admin PIN</label>
              <input id="pin" type="password" inputmode="numeric" placeholder="Enter PIN" />
            </div>
            <div class="form__actions">
              <button class="btn btn--dark" id="pinBtn" type="button">Unlock</button>
              <a class="btn btn--ghost" href="#/home">Cancel</a>
            </div>
            <p class="note">Default demo PIN: <strong>1234</strong> (change it in <code>app.js</code>).</p>
          </div>
        </section>
      </div>
    `;
    $("#pinBtn").addEventListener("click", () => {
      const pin = $("#pin").value.trim();
      if (pin === ADMIN_PIN) {
        setAdminSession(true);
        toast("Admin unlocked");
        location.hash = "#/admin";
      } else {
        toast("Wrong PIN");
      }
    });
    revealSetup();
    return;
  }

  $("#page").innerHTML = `
    <div class="container">
      <section class="section reveal">
        <div class="section__head">
          <div>
            <h1 class="section__title" style="font-size:30px">Admin Panel</h1>
            <p class="section__desc">Upload products and they’ll instantly appear across the site.</p>
          </div>
          <div style="display:flex; gap:10px; flex-wrap:wrap">
            <button class="btn" id="logoutBtn" type="button">Logout</button>
            <a class="btn btn--dark" href="#/collections">View store</a>
          </div>
        </div>

        <div class="form reveal">
          <div class="form__grid">
            <div class="field">
              <label for="pName">Product name</label>
              <input id="pName" placeholder="e.g., Satin Wrap Midi Dress" />
            </div>
            <div class="field">
              <label for="pPrice">Price (INR)</label>
              <input id="pPrice" type="number" min="0" step="1" placeholder="1899" />
            </div>
            <div class="field">
              <label for="pCategory">Category</label>
              <select id="pCategory">
                ${CATEGORIES.map((c) => `<option value="${escapeHTML(c.key)}">${escapeHTML(c.label)}</option>`).join("")}
              </select>
            </div>
            <div class="field">
              <label for="pTags">Tags (comma separated)</label>
              <input id="pTags" placeholder="trending, new, kurta, saree, blazer" />
            </div>
          </div>

          <div class="form__grid" style="margin-top:12px">
            <div class="field">
              <label for="pImg">Upload image (recommended)</label>
              <input id="pImg" type="file" accept="image/*" />
            </div>
            <div class="field">
              <label for="pImgUrl">Or image URL (optional)</label>
              <input id="pImgUrl" placeholder="https://..." />
            </div>
          </div>

          <div class="field" style="margin-top:12px">
            <label for="pDesc">Description</label>
            <textarea id="pDesc" placeholder="Write a short boutique-style description..."></textarea>
          </div>

          <div class="form__actions">
            <button class="btn btn--dark" id="saveProduct" type="button">Upload product</button>
            <button class="btn btn--ghost" id="resetProducts" type="button">Reset demo products</button>
          </div>
          <p class="note">All admin changes are saved in your browser <strong>localStorage</strong> (no server needed).</p>
        </div>
      </section>

      <section class="section reveal">
        <div class="section__head">
          <div>
            <h2 class="section__title">Current products</h2>
            <p class="section__desc">You can delete items anytime.</p>
          </div>
        </div>
        <div class="grid" id="adminGrid"></div>
      </section>
    </div>
  `;

  $("#logoutBtn").addEventListener("click", () => {
    setAdminSession(false);
    toast("Logged out");
    location.hash = "#/home";
  });

  $("#resetProducts").addEventListener("click", () => {
    setProducts(seedProducts());
    toast("Reset to demo products");
    renderAdmin();
  });

  $("#pImg").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    toast("Uploading image to Cloudinary...");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", "fashion-store");

    try {
      const envName = "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME";
      const cloudName = 
          (typeof process !== "undefined" && process.env && process.env[envName]) 
          || (window.__ENV__ && window.__ENV__[envName]) 
          || window[envName] 
          || "fashion-store";

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Upload failed");
      
      $("#pImgUrl").value = data.secure_url;
      // Clear the file input so it doesn't double-upload via backend
      $("#pImg").value = ""; 
      toast("Image uploaded automatically!");
    } catch (err) {
      toast("Cloudinary upload Error: " + err.message);
      console.error(err);
    }
  });

  $("#saveProduct").addEventListener("click", async () => {
    const name = $("#pName").value.trim();
    const price = Number($("#pPrice").value);
    const category = $("#pCategory").value;
    const tags = $("#pTags").value
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 12);
    const description = $("#pDesc").value.trim();
    const imgUrl = $("#pImgUrl").value.trim();
    const file = $("#pImg").files?.[0] || null;

    if (!name || !Number.isFinite(price) || price <= 0) {
      toast("Please enter a name and a valid price.");
      return;
    }

    try {
      // Cloud mode: upload image to Cloudinary and store product in DB.
      if (PRODUCTS_MODE.source === "api") {
        let imageUrl = imgUrl;
        if (file) imageUrl = await uploadImageCloud(file);
        if (!imageUrl) {
          toast("Please upload an image or provide an image URL.");
          return;
        }

        await createProductCloud({
          name,
          price: Math.round(price),
          category,
          tags,
          description,
          image_url: imageUrl,
        });
        toast("Product uploaded");
        // Re-fetch products so the storefront updates immediately.
        await initProductsCloud();
        renderAdmin();
        return;
      }

      // Local fallback (existing behavior)
      let image = imgUrl;
      if (file) {
        if (file.size > 1_800_000) {
          toast("Image too large. Please use a smaller file (under ~1.8MB).");
          return;
        }
        image = await fileToDataURL(file);
      }

      if (!image) {
        toast("Please upload an image or provide an image URL.");
        return;
      }

      const next = [
        {
          id: uid(),
          name,
          price: Math.round(price),
          category,
          tags,
          description,
          image,
        },
        ...getProducts(),
      ];

      setProducts(next);
      toast("Product uploaded");
      renderAdmin();
    } catch (err) {
      toast(err.message || "Upload failed");
    }
  });

  renderAdminGrid();
  revealSetup();
}

function renderAdminGrid() {
  const grid = $("#adminGrid");
  const products = getProducts();
  grid.innerHTML = products.map(cardHTML).join("");
  bindCards($("#page"));
  $$(".card", grid).forEach((card) => {
    const id = card.dataset.id;
    const body = $(".card__body", card);

    const edit = document.createElement("button");
    edit.className = "btn";
    edit.type = "button";
    edit.textContent = "Edit";
    edit.style.width = "100%";
    edit.style.marginTop = "10px";
    body.appendChild(edit);

    const del = document.createElement("button");
    del.className = "btn btn--ghost";
    del.type = "button";
    del.textContent = "Delete";
    del.style.width = "100%";
    del.style.marginTop = "10px";
    body.appendChild(del);

    edit.addEventListener("click", async () => {
      const p = getProducts().find((x) => x.id === id);
      if (!p) return;

      const newName = prompt("Product name", p.name) ?? p.name;
      const newPriceRaw = prompt("Price (INR)", String(p.price)) ?? String(p.price);
      const newPrice = Number(newPriceRaw);
      const newDesc = prompt("Description", p.description || "") ?? (p.description || "");
      const newCategory = prompt("Category (dresses/tops/ethnic/new-arrivals)", p.category) ?? p.category;
      if (!newName.trim() || !Number.isFinite(newPrice) || newPrice <= 0) {
        toast("Invalid name or price");
        return;
      }

      try {
        if (PRODUCTS_MODE.source === "api") {
          await updateProductCloud(id, {
            name: newName.trim(),
            price: Math.round(newPrice),
            description: newDesc.trim(),
            category: newCategory.trim(),
          });
          await initProductsCloud();
          toast("Updated");
          renderAdmin();
          return;
        }

        const next = getProducts().map((x) =>
          x.id === id
            ? { ...x, name: newName.trim(), price: Math.round(newPrice), description: newDesc.trim(), category: newCategory.trim() }
            : x
        );
        setProducts(next);
        toast("Updated");
        renderAdmin();
      } catch (err) {
        toast(err.message || "Update failed");
      }
    });

    del.addEventListener("click", () => {
      (async () => {
        try {
          if (PRODUCTS_MODE.source === "api") {
            await deleteProductCloud(id);
            await initProductsCloud();
            toast("Deleted");
            renderAdmin();
            return;
          }
          const next = getProducts().filter((p) => p.id !== id);
          setProducts(next);
          toast("Deleted");
          renderAdmin();
        } catch (err) {
          toast(err.message || "Delete failed");
        }
      })();
    });
  });
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(file);
  });
}

function getSearchTerm() {
  return ($("#searchInput").value || "").trim().toLowerCase();
}

function renderRoute() {
  const route = parseRoute();
  setActiveNav(route);
  closeNavIfMobile();

  const [a, b] = route.parts;

  const render = () => {
    if (!a || a === "home") return renderHome();
    if (a === "collections") return renderCollections();
    if (a === "about") return renderAbout();
    if (a === "contact") return renderContact();
    if (a === "admin") {
      if (b === "upload") return renderAdminUpload();
      return renderAdmin();
    }
    if (a === "gallery") return renderGallery();
    if (a === "checkout") return renderCheckout();
    if (a === "order-success") return renderOrderSuccess(route.query);
    if (a === "login") return renderLogin();
    if (a === "signup") return renderSignup();
    if (a === "forgot") return renderForgot();
    if (a === "verify-otp") return renderVerifyOtp();
    if (a === "reset-password") return renderResetPassword();
    if (a === "new-arrivals") return renderNewArrivals(route.query);
    if (a === "category" && b) return renderCategory(b, route.query);
    return renderHome();
  };

  pageTransition(render);
}


function renderAdminUpload() {
  const env = window.__ENV__ || {};
  const cloudName = env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  $("#page").innerHTML = `
    <div class="container">
      <section class="section reveal">
        <div class="section__head">
          <div>
            <h1 class="section__title" style="font-size:30px">Upload Photos</h1>
            <p class="section__desc">Admin Dashboard - Cloudinary Upload</p>
          </div>
        </div>
        <div style="margin-bottom: 20px;">
          <button class="btn btn--dark" id="cloudinaryUploadWidget" type="button">Click to Upload</button>
        </div>
        <div class="grid" id="uploadedPreviewGrid" style="gap: 16px;"></div>
      </section>
    </div>
  `;

  const btn = $("#cloudinaryUploadWidget");
  if (cloudName && window.cloudinary) {
    const uploadWidget = window.cloudinary.createUploadWidget({
      cloudName: cloudName,
      uploadPreset: 'fashion-store',
      sources: ['local', 'url']
    }, (error, result) => {
      if (!error && result && result.event === "success") {
        toast("Upload successful!");
        const div = document.createElement("div");
        div.innerHTML = `<img class="card__img" src="${result.info.secure_url}" style="border-radius: 8px; width: 100%; aspect-ratio: 3/4; object-fit: cover;" />`;
        $("#uploadedPreviewGrid").appendChild(div);
      }
    });

    btn.addEventListener("click", () => {
      uploadWidget.open();
    });
  } else {
    btn.textContent = "Cloudinary not configured";
    btn.disabled = true;
  }
  revealSetup();
}

function renderGallery() {
  $("#page").innerHTML = `
    <div class="container">
      <section class="section reveal">
        <div class="section__head">
          <div>
            <h1 class="section__title" style="font-size:30px">Gallery</h1>
            <p class="section__desc">All uploaded images from Cloudinary.</p>
          </div>
        </div>
        <div class="grid" id="galleryGrid">Loading...</div>
      </section>
    </div>
  `;

  apiFetch("/api/cloudinary/gallery")
    .then(data => {
      const grid = $("#galleryGrid");
      if (data && data.images && data.images.length > 0) {
        grid.innerHTML = data.images.map(img => `
          <article class="card reveal">
            <div class="card__media" style="aspect-ratio: 3/4;">
              <img class="card__img" src="${escapeHTML(img)}" alt="Gallery item" loading="lazy" />
            </div>
          </article>
        `).join("");
      } else {
        grid.innerHTML = "<p>No images found in gallery.</p>";
      }
      revealSetup();
    })
    .catch(err => {
      $("#galleryGrid").innerHTML = "<p>Failed to load gallery.</p>";
    });
}

function renderCheckout() {
  const cart = getCart();
  const products = getProducts();
  const entries = Object.entries(cart).filter(([, q]) => q > 0);

  if (entries.length === 0) {
    location.hash = "#/home";
    return;
  }

  let subtotal = 0;
  const items = entries.map(([id, qty]) => {
    const p = products.find((x) => x.id === id);
    if (p) subtotal += (p.price || 0) * qty;
    return { product: p, qty };
  }).filter(i => i.product);

  const shipping = subtotal > 1999 ? 0 : 150;
  const total = subtotal + shipping;

  $("#page").innerHTML = `
    <div class="container" style="max-width: 800px;">
      <section class="section reveal">
        <h1 class="section__title" style="margin-bottom:20px;">Checkout</h1>
        
        <div class="checkout-grid" style="display: grid; gap: 32px; grid-template-columns: 1fr; @media(min-width: 768px){ grid-template-columns: 1.5fr 1fr; }">
          
          <div class="checkout-form">
            <h2 style="font-size: 1.2rem; margin-bottom: 16px;">Delivery Details</h2>
            <form id="checkoutForm" class="form">
              <div class="field">
                <label>Full Name</label>
                <input id="coName" required placeholder="Jane Doe" />
              </div>
              <div class="form__grid">
                <div class="field">
                  <label>Email</label>
                  <input id="coEmail" type="email" required placeholder="you@example.com" />
                </div>
                <div class="field">
                  <label>Phone</label>
                  <input id="coPhone" type="tel" required pattern="[0-9]{10}" placeholder="10 digit mobile" />
                </div>
              </div>
              
              <h3 style="font-size: 1rem; margin: 16px 0 8px;">Address</h3>
              <div class="field">
                <input id="coAddr" required placeholder="Flat, House no., Building, Company, Apartment" />
              </div>
              <div class="form__grid">
                <div class="field">
                  <input id="coCity" required placeholder="City" />
                </div>
                <div class="field">
                  <input id="coState" required placeholder="State" />
                </div>
                <div class="field">
                  <input id="coZip" required type="text" pattern="[0-9]{6}" placeholder="Pincode" />
                </div>
              </div>
              
              <button class="btn btn--dark btn--full" style="margin-top: 24px;" type="submit" id="payBtn">Proceed to Pay ${money(total)}</button>
            </form>
          </div>

          <div class="checkout-summary" style="background: var(--surface); padding: 24px; border-radius: 8px;">
            <h2 style="font-size: 1.2rem; margin-bottom: 16px;">Order Summary</h2>
            <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px;">
              ${items.map(i => `
                <div style="display: flex; gap: 12px;">
                  <img src="${escapeHTML(i.product.image)}" style="width: 60px; height: 80px; object-fit: cover; border-radius: 4px;" />
                  <div>
                    <strong style="display: block; font-size: 0.95rem;">${escapeHTML(i.product.name)}</strong>
                    <span class="muted" style="font-size: 0.85rem;">Qty: ${i.qty}</span>
                    <div style="font-size: 0.95rem; margin-top: 4px;">${money(i.product.price * i.qty)}</div>
                  </div>
                </div>
              `).join("")}
            </div>
            
            <div style="border-top: 1px solid var(--border); padding-top: 16px; display: flex; flex-direction: column; gap: 8px;">
              <div style="display: flex; justify-content: space-between;">
                <span class="muted">Subtotal</span>
                <span>${money(subtotal)}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span class="muted">Shipping</span>
                <span>${shipping === 0 ? 'Free' : money(shipping)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 1.1rem; border-top: 1px solid var(--border); padding-top: 8px; margin-top: 8px;">
                <span>Total</span>
                <span>${money(total)}</span>
              </div>
            </div>
          </div>
          
        </div>
      </section>
    </div>
  `;

  $("#checkoutForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = $("#payBtn");
    btn.disabled = true;
    btn.textContent = "Processing...";

    const customerDetails = {
      name: $("#coName").value,
      email: $("#coEmail").value,
      phone: $("#coPhone").value,
      address: {
        street: $("#coAddr").value,
        city: $("#coCity").value,
        state: $("#coState").value,
        zip: $("#coZip").value
      }
    };

    try {
      const res = await apiFetch("/api/create-order", {
        method: "POST",
        body: JSON.stringify({ amount: total })
      });

      if (!res.ok || !res.order) {
        throw new Error("Failed to initialize payment");
      }

      const env = window.__ENV__ || {};
      
      const options = {
        key: env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: res.order.amount,
        currency: res.order.currency,
        name: "Ramya Radha Boutique",
        description: "Order Payment",
        order_id: res.order.id,
        handler: async function (response) {
          try {
            const captureRes = await apiFetch("/api/capture-order", {
              method: "POST",
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                customerDetails,
                items: items.map(i => ({ id: i.product.id, name: i.product.name, price: i.product.price, qty: i.qty })),
                amount: total
              })
            });

            if (captureRes.ok) {
              setCart({});
              location.hash = "#/order-success?id=" + encodeURIComponent(captureRes.savedOrder?.id || response.razorpay_order_id) + "&name=" + encodeURIComponent(customerDetails.name) + "&email=" + encodeURIComponent(customerDetails.email);
            } else {
              throw new Error("Order capture failed");
            }
          } catch (err) {
            console.error(err);
            toast("Payment captured, but failed to save order details.");
          }
        },
        prefill: {
          name: customerDetails.name,
          email: customerDetails.email,
          contact: customerDetails.phone
        },
        theme: {
          color: "#222222"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        toast("Payment failed. Please try again.");
        btn.disabled = false;
        btn.textContent = `Proceed to Pay ${money(total)}`;
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      toast("Error starting payment.");
      btn.disabled = false;
      btn.textContent = `Proceed to Pay ${money(total)}`;
    }
  });

  revealSetup();
}

function renderOrderSuccess(query) {
  const id = query.id || "Unknown";
  const name = query.name || "Customer";
  const email = query.email || "";

  $("#page").innerHTML = `
    <div class="container" style="text-align: center; max-width: 600px; padding: 60px 20px;">
      <div style="font-size: 48px; margin-bottom: 20px;">🎉</div>
      <h1 class="section__title">Payment Successful!</h1>
      <p class="section__desc" style="margin-top: 16px;">Thank you for your order, ${escapeHTML(name)}.</p>
      
      <div style="background: var(--surface); padding: 24px; border-radius: 8px; margin: 32px 0;">
        <p class="muted" style="margin: 0 0 8px;">Order Reference ID</p>
        <strong style="font-size: 1.1rem;">${escapeHTML(id)}</strong>
      </div>
      
      <p style="margin-bottom: 32px;">An order confirmation has been emailed to you. Estimated delivery is 3-5 business days.</p>
      
      <a class="btn btn--dark" href="#/home">Continue Shopping</a>
    </div>
  `;

  const env = window.__ENV__ || {};
  if (email && env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY && env.NEXT_PUBLIC_EMAILJS_SERVICE_ID && env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID) {
    if (window.emailjs) {
        window.emailjs.init(env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY);
        window.emailjs.send(env.NEXT_PUBLIC_EMAILJS_SERVICE_ID, env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID, {
          from_name: "Ramya Radha Boutique",
          reply_to: "no-reply@example.com",
          to_email: email,
          message: `Your order (${id}) was successful! Thank you so much.`
        }).catch(console.error);
    }
  }

  revealSetup();
}

function setupNav() {
  const burger = $("#navBurger");
  burger.addEventListener("click", () => {
    const menu = $("#navMenu");
    const open = !menu.classList.contains("is-open");
    menu.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    syncOverlay();
  });

  $$(".nav__dropdown > button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!expanded));
    });
  });

  // Ensure menu closes on any link click (Vanilla alternative to setMenuOpen(false))
  $$(".nav__link").forEach((link) => {
    link.addEventListener("click", () => {
      closeNavIfMobile();
    });
  });
}

function setupGlobalUI() {
  $("#year").textContent = String(new Date().getFullYear());

  const brand = $(".brand");
  const logo = $(".brand__logo");
  if (brand && logo) {
    const fallback = () => brand.classList.add("brand--noLogo");
    logo.addEventListener("error", fallback, { once: true });
    if (!logo.getAttribute("src")) fallback();
  }

  setupAccountMenu();

  $("#overlay").addEventListener("click", () => {
    closeModal();
    closeCart();
    closeNavIfMobile();
    syncOverlay();
  });

  $("#modalClose").addEventListener("click", closeModal);
  $("#cartBtn").addEventListener("click", openCart);
  $("#cartClose").addEventListener("click", closeCart);

  $("#checkoutBtn").addEventListener("click", () => {
    const cart = getCart();
    if (cartCount(cart) === 0) return toast("Your cart is empty.");
    closeCart();
    location.hash = "#/checkout";
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
      closeCart();
      closeNavIfMobile();
    }
  });

  $("#newsletterForm").addEventListener("submit", (e) => {
    e.preventDefault();
    toast("You’re subscribed. Welcome to Ramya Radha Boutique!");
    e.currentTarget.reset();
  });

  const search = $("#searchInput");
  search.addEventListener("input", () => {
    renderRoute();
  });
  $("#searchClear").addEventListener("click", () => {
    search.value = "";
    renderRoute();
    search.focus();
  });

  $("#openAdminBtn").addEventListener("click", () => {
    location.hash = "#/admin";
  });
}

function setupAccountMenu() {
  const area = $("#accountArea");
  const btn = $("#accountBtn");
  const panel = $("#accountPanel");
  const label = $("#accountLabel");
  const primary = $("#accountPrimaryLink");
  const secondary = $("#accountSecondaryLink");
  const logout = $("#accountLogoutBtn");
  if (!area || !btn || !panel || !label || !primary || !secondary || !logout) return;

  const open = (on) => {
    area.classList.toggle("is-open", on);
    btn.setAttribute("aria-expanded", String(on));
    syncOverlay();
  };

  btn.addEventListener("click", () => open(!area.classList.contains("is-open")));

  document.addEventListener("click", (e) => {
    if (!area.contains(e.target)) open(false);
  });

  const render = (user) => {
    if (user?.name) {
      label.textContent = `Hi, ${user.name.split(" ")[0]}`;
      primary.textContent = "My account";
      primary.setAttribute("href", "#/home");
      secondary.textContent = "Forgot password";
      secondary.setAttribute("href", "#/forgot");
      logout.hidden = false;
    } else {
      label.textContent = "Login";
      primary.textContent = "Login";
      primary.setAttribute("href", "#/login");
      secondary.textContent = "Create account";
      secondary.setAttribute("href", "#/signup");
      logout.hidden = true;
    }
  };

  logout.addEventListener("click", async () => {
    try {
      await apiFetch(API.logout, { method: "POST" });
      render(null);
      toast("Logged out");
      open(false);
      // If they were on auth pages, keep them there; otherwise stay put.
    } catch (err) {
      toast(err.message || "Logout failed");
    }
  });

  // initial state from backend session cookie
  apiFetch(API.me)
    .then((data) => render(data.user))
    .catch(() => render(null));
}

async function main() {
  ensureSeed();
  await initProductsCloud();
  setupNav();
  setupGlobalUI();
  syncCartUI();
  window.addEventListener("hashchange", renderRoute);
  if (!location.hash) location.hash = "#/home";
  renderRoute();
}

main();

