# COD CRM Morocco

Production-ready monorepo for a COD-focused E-commerce CRM in Morocco.

## Stack
- Frontend: React + Vite + Tailwind + Zustand
- Backend: Node.js + Express + Prisma + PostgreSQL + JWT
- Integrations: Google Sheets import, WhatsApp links, click-to-call links, mock delivery provider (Ameex-ready)

## Features delivered
- Auth with role-based access (ADMIN / AGENT)
- Orders import (Google Sheets + manual fallback)
- Phone deduplication logic with history-sensitive replacement
- Multi-attempt call center workflow + scheduling
- Auto-move confirmed orders to shipping queue
- Delivery lifecycle: shipping queue → shipped → delivered/returned
- Agent dashboard KPI + earnings logic (10 MAD delivered + 5 MAD delivered upsell)
- Admin financial dashboard + ad metrics input API
- Right-side order history panel + upsell registration

## Run locally
```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev
```

### Default users
- admin@codcrm.ma / admin1234
- agent@codcrm.ma / agent1234

## API overview
- `POST /api/auth/login`
- `POST /api/orders/import/google-sheets`
- `POST /api/orders/import/manual`
- `PATCH /api/orders/:id/workflow`
- `PATCH /api/orders/:id/schedule`
- `POST /api/orders/:id/upsell`
- `POST /api/orders/:id/delivery/push`
- `PATCH /api/orders/:id/delivery/status`
- `GET /api/agents/kpis`
- `GET /api/admin/metrics`
