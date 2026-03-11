# Ramya Radha Boutique — Women’s Fashion (HTML/CSS/JS)

A modern, elegant, responsive women’s clothing boutique website inspired by premium fashion retail UX (H&M-like feel), focused **only on female fashion**.

## Run

You can open `index.html` directly, but for best results use a simple local server:

- VS Code / Cursor: install “Live Server” and click **Go Live**
- Or with Node:

```bash
npx serve .
```

Then open the shown local URL.

## Features

- Sticky navbar with dropdown menus + mobile drawer navigation
- Homepage hero + featured + trending sections with smooth reveal animations
- Product grid gallery + hover effects
- Product quick-view modal (full-screen style) with **image zoom on hover**
- **Add to cart** drawer with quantity controls + subtotal
- Filtering by category/tags and instant search
- Footer social links + contact details + newsletter signup

## Admin panel (Product upload)

- Open **Admin** (top bar) or go to `#/admin`
- Default PIN: **1234** (change `ADMIN_PIN` in `app.js`)
- Upload:
  - Product name, price, category, tags, description
  - Upload an image file (stored in `localStorage`) or paste an image URL
- Uploaded items instantly appear in the storefront grids.

## Data storage

This project uses browser `localStorage`:

- Products: `boutique_products_v1`
- Cart: `boutique_cart_v1`

No backend is required.

