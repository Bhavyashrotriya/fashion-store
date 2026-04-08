# Ramya Radha Boutique — Women’s Fashion (HTML/CSS/JS)

A modern, elegant, responsive women’s clothing boutique website inspired by premium fashion retail UX (H&M-like feel), focused **only on female fashion**.

## Run

This project now includes a secure auth backend (Login/Signup/OTP reset).

### Start the full app (recommended)

```bash
npm install
npm run dev
```

Then open `http://localhost:5178`.

### Auth pages

- Login: `#/login`
- Signup: `#/signup`
- Forgot password: `#/forgot` → `#/verify-otp` → `#/reset-password`

## Features

- Sticky navbar with dropdown menus + mobile drawer navigation
- Homepage hero + featured + trending sections with smooth reveal animations
- Product grid gallery + hover effects
- Product quick-view modal (full-screen style) with **image zoom on hover**
- **Add to cart** drawer with quantity controls + subtotal
- Filtering by category/tags and instant search
- Footer social links + contact details + newsletter signup
- Secure authentication: Signup, Login (email/phone), Forgot password (OTP + reset)

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

## Auth backend security notes

- Passwords are hashed with `bcryptjs` (never stored in plain text)
- OTP is 6-digit, expires in ~3 minutes, rate-limited
- Sessions use an httpOnly cookie (JWT)
- For production, set environment variables:
  - `JWT_SECRET` (required)
  - `NODE_ENV=production`
  - `COOKIE_SECURE=true` (if behind HTTPS)
