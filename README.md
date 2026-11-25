# GOKUL GHEE — Official Digital Storefront & Commerce Platform

**Business Name:** Anil Ji Ka Gokul Ghee  
**Brand Display Name:** GOKUL GHEE  
**Tagline:** Tradition in Every Taste.  
**Location:** Math Road, Near Hindu Society Mandir, Anand Bazar, Danapur Cantonment, Patna, Bihar, India – 801503  
**Public Phone:** +91 89863 65592 *(Verify before production launch)*  
**Hours:** 9:00 AM – 9:00 PM daily *(Verify before production launch)*  

---

## Architecture Overview

This repository is structured with a clear separation between the customer/admin React storefront (`frontend/`, deployable to Vercel) and the Node.js/Express/MongoDB API (`backend/`, deployable to Render).

- `frontend/` — React 19 + Vite + Tailwind CSS + React Router + Lucide React + Vitest
- `backend/` — Modular MVC Express.js + Mongoose + Socket.IO + Gemini + Razorpay + Cloudinary scaffold (built in Phases 3–6)
- `docs/` — Platform Architecture & Design System specifications

## Development Phases

- **Phase 1 (Done):** Workspace setup, architecture blueprint, design system, homepage, navigation, product discovery (`/shop`, `/shop/:category`, `/product/:slug`, `/search`), store & policy pages, responsive layouts, and component tests.
- **Phase 2 (Done):** Customer authentication UI (`/login`, `/register`), persistent Cart + Cart Drawer (`/cart`), Wishlist (`/wishlist`), Account & Order Lifecycle UI (`/account`, `/account/orders`, `/account/orders/:id`), and floating **GOKUL AI** side assistant widget (catalog-grounded until Gemini backend connects in Phase 6).
- **Phase 3 (Done):** Backend Express MVC (`backend/app.js`, `server.js`), 15 Mongoose models for MongoDB Atlas, JWT HTTP-only cookie auth, Zod validation, Multer/Cloudinary image pipeline, REST APIs, CLI seed/admin scripts, and frontend service integration.
- **Phase 4 (Done):** Server-validated Checkout (`/checkout`), 6-digit pincode availability checks, coupon validation, atomic stock reservation & cancellation restore, COD & cryptographic Razorpay verification/webhook pipeline, verified delivery reviews, and order notifications.
- **Phase 5 (Done):** Dedicated independent Admin Panel (`/admin/login` and 12 workspace modules across products, categories, inventory stock movements, orders, customers, delivery zones, coupons, reviews, database-backed analytics, AI/website/system telemetry meter, and store settings) with live RBAC, HTTP timing middleware, and test suites.
- **Phase 6 (Done):** Interactive Google Maps delivery address picker (`Use Current Location` GPS, address search, draggable pin, official Place ID resolution), live Google Gemini AI backend for **GOKUL AI** (`POST /api/v1/ai/chat`, rate-limited, conversation history persisted, real `usageMetadata` token logging to `AIUsage`), and JWT-authenticated Socket.IO real-time order lifecycle updates.
- **Phase 7 (Next):** End-to-end security hardening, optimization, production deployment guides, and connecting live **MongoDB Atlas URI** + initial database seeding.

## Running Frontend (Phase 1)

```bash
cd frontend
npm install
npm run dev
npm test
npm run build
```
