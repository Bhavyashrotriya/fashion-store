/* Boutique SPA (no backend): products + cart stored in localStorage */

const STORAGE = {
  products: "boutique_products_v1",
  cart: "boutique_cart_v1",
  adminSession: "boutique_admin_session_v1",
};

const ADMIN_PIN = "1234"; // demo PIN; change if you want

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
  return readJSON(STORAGE.products, []);
}
function setProducts(next) {
  writeJSON(STORAGE.products, next);
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

        <div class="form reveal">
          <div class="form__grid">
            <div class="field">
              <label for="cName">Name</label>
              <input id="cName" placeholder="Your name" />
            </div>
            <div class="field">
              <label for="cEmail">Email</label>
              <input id="cEmail" type="email" placeholder="you@example.com" />
            </div>
          </div>
          <div class="field" style="margin-top:12px">
            <label for="cMsg">Message</label>
            <textarea id="cMsg" placeholder="Tell us what you’re looking for..."></textarea>
          </div>
          <div class="form__actions">
            <button class="btn btn--dark" id="contactSend" type="button">Send</button>
            <a class="btn btn--ghost" href="#/home">Back to home</a>
          </div>
          <p class="note">This is a demo form. We’ll show a confirmation toast.</p>
        </div>
      </section>
    </div>
  `;

  $("#contactSend").addEventListener("click", () => {
    toast("Thanks! We’ll get back to you shortly.");
  });
  revealSetup();
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
    const del = document.createElement("button");
    del.className = "btn btn--ghost";
    del.type = "button";
    del.textContent = "Delete";
    del.style.width = "100%";
    del.style.marginTop = "10px";
    body.appendChild(del);
    del.addEventListener("click", () => {
      const next = getProducts().filter((p) => p.id !== id);
      setProducts(next);
      toast("Deleted");
      renderAdmin();
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
    if (a === "admin") return renderAdmin();
    if (a === "new-arrivals") return renderNewArrivals(route.query);
    if (a === "category" && b) return renderCategory(b, route.query);
    return renderHome();
  };

  pageTransition(render);
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
    toast("Checkout is a demo. Thanks for shopping!");
    setCart({});
    renderCart();
    closeCart();
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

function main() {
  ensureSeed();
  setupNav();
  setupGlobalUI();
  syncCartUI();
  window.addEventListener("hashchange", renderRoute);
  if (!location.hash) location.hash = "#/home";
  renderRoute();
}

main();

