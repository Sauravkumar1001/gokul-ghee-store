# GOKUL GHEE — System Architecture Blueprint

## 1. Platform Objectives

Build a production-grade, full-stack MERN e-commerce platform for **Anil Ji Ka Gokul Ghee** (Danapur Cantonment, Patna, Bihar), supporting:
- High-trust editorial storefront and catalog discovery
- Serviceable-pincode and map-pin validated hyperlocal/regional delivery (never assuming nationwide shipping)
- Transactional order management with real-time stock reservation (`PLACED` → `CONFIRMED` → `PREPARING` → `READY FOR DISPATCH` → `SHIPPED` → `OUT FOR DELIVERY` → `DELIVERED`, plus `CANCELLED` / `REFUNDED`)
- Verified payment flows (COD + Razorpay signature & webhook verification)
- **GOKUL AI** grounded shopping assistant backed exclusively by MongoDB catalog, pincode rules, and authenticated order status
- Independent Admin Panel with real analytics events and AI token/cost telemetry

---

## 2. Deployment Topology

| Layer | Host / Service | Directory | Notes |
|---|---|---|---|
| Frontend SPA (Storefront + Admin UI) | Vercel | `frontend/` | Vite static bundle, SPA fallback routing |
| Backend REST + WebSocket API | Render | `backend/` | Express + Socket.IO long-lived Node service |
| Primary Database | MongoDB Atlas | — | Transactions enabled via replica set |
| Media Storage | Cloudinary | — | Signed/validated uploads via Multer -> Cloudinary |
| Payments | Razorpay | — | Server-side order creation, HMAC signature & webhook verification |
| AI Assistant | Google Gemini API | — | Server-side only; rate-limited & token-logged |
| Maps & Geolocation | Google Maps API | — | Place ID `ChIJ53Oz9XZX7TkRW_5zLDQrlaI` + URL fallback |

---

## 3. Repository Structure

```
GokulGhee/
├── frontend/
│   ├── public/images/
│   ├── src/
│   │   ├── config/          # Verified store config & environment bindings
│   │   ├── data/            # Phase 1 clearly marked sample seed data (replaced by API in Phase 3)
│   │   ├── styles/          # Design tokens & typography CSS
│   │   ├── utils/           # Currency, URL, Google Maps fallback helpers
│   │   ├── hooks/           # Reusable client hooks (recently viewed, media queries)
│   │   ├── components/
│   │   │   ├── common/      # Reusable UI primitives
│   │   │   ├── layout/      # Announcement bar, navbar, footer, page shell
│   │   │   ├── home/        # 17-section editorial homepage modules
│   │   │   └── product/     # Cards, filters, gallery, variant selector
│   │   ├── pages/           # Route-level page views
│   │   └── tests/           # Vitest + React Testing Library suites
│   └── package.json
└── backend/                 # MVC scaffold activated in Phase 3+
    ├── config/              # DB, Cloudinary, Razorpay, Gemini, CORS config
    ├── controllers/         # Thin HTTP handlers delegating to services
    ├── models/              # User, Product, Category, Order, Inventory, Address, Coupon, Review, Conversation, AIUsage, DeliveryZone, Notification, AnalyticsEvent
    ├── routes/              # Versioned REST routes (/api/v1/...)
    ├── middleware/          # Auth (JWT cookie), RBAC, rate-limit, Zod validation, error handler
    ├── services/            # Transactional order/stock, AI grounding, delivery pincode check, analytics
    ├── validators/          # Zod schemas
    ├── utils/               # ApiError, asyncHandler, logger
    ├── app.js               # Express app wiring
    └── server.js            # HTTP + Socket.IO entrypoint
```

---

## 4. Core Architectural Guardrails

1. **Zero Fabricated Claims:** Sample catalog items in Phase 1 carry `isSample: true` and transparent owner-replacement notices. No invented certifications, fake reviews, or fake coordinates.
2. **Backend Price & Stock Authority:** Client carts transmit product/variant IDs and quantities only; checkout recomputes pricing, coupons, delivery fees, and atomic stock reservations server-side.
3. **Store vs. Customer Location Separation:** Store identity (`Anil Ji Ka Gokul Ghee`, Place ID `ChIJ53Oz9XZX7TkRW_5zLDQrlaI`) is stored in configurable store settings and never conflated with customer delivery addresses.
4. **Honest Telemetry & Reviews:** Customer reviews come only from verified orders or verified external links; analytics and AI usage meters reflect stored `AnalyticsEvent` and `AIUsage` documents.
5. **Key Isolation:** Gemini, Razorpay secret, Cloudinary secret, and JWT secrets remain strictly inside `backend/.env`.
