# BioMed Software Hospital — ERP System

A full-stack ERP for hospital biomedical departments. Track equipment, maintenance schedules, inventory, and work orders. Built with React 19, Vite, Tailwind CSS v4, Express, tRPC 11, and MySQL/Drizzle ORM.

## Quick Start (No Database Required)

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`. The app runs in **demo mode** with realistic sample data — no database, no credentials needed.

## Full Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Key variables:
- `DATABASE_URL` — MySQL connection string (required for production)
- `JWT_SECRET` — Cookie signing secret (required in production)
- `VITE_APP_ID` / `OAUTH_SERVER_URL` — Manus OAuth (for auth, not needed in demo mode)
- `OWNER_OPEN_ID` — Manus OpenID of the first admin user

### 3. Set up database (production)

```bash
pnpm db:push
```

### 4. Run

```bash
pnpm dev     # Development
pnpm build   # Production build
pnpm start   # Production server
```

## Features

- **Dashboard** — Key metrics and activity charts (Recharts)
- **Equipment Registry** — Full CRUD with status tracking, serial numbers, locations
- **Maintenance Scheduling** — Preventive/corrective/inspection with technician assignment
- **Inventory Management** — Stock levels, low-stock alerts, supplier info
- **Work Orders** — Priority-based task queue linked to equipment
- **QR Code Tracking** — Generate and scan QR codes for equipment lookup
- **Role-Based Access** — Admin vs technician permissions via Manus OAuth
- **Demo Mode** — Full CRUD with sample data, no infrastructure required

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS v4, shadcn/ui |
| Routing | Wouter |
| State | React Query + tRPC |
| Backend | Express.js, tRPC 11 |
| Database | MySQL/TiDB with Drizzle ORM |
| Auth | Manus OAuth + JWT via `jose` |
| Charts | Recharts |
| Icons | Lucide React |

## Project Structure

```
BIOMED_SOFTWARE_HOSPITAL/
├── client/                 # Vite SPA frontend
│   └── src/
│       ├── pages/          # Route pages (Dashboard, Equipment, etc.)
│       ├── components/     # UI components + DashboardLayout
│       │   └── ui/         # shadcn/ui components
│       ├── hooks/          # Custom React hooks
│       ├── lib/             # tRPC client + utilities
│       └── contexts/        # React context providers
├── server/                 # Express API server
│   ├── routers.ts          # tRPC procedure definitions
│   ├── db.ts               # Database queries + demo mode
│   └── _core/              # Server infrastructure
│       ├── trpc.ts         # tRPC setup, protectedProcedure
│       ├── sdk.ts          # Manus OAuth + JWT sessions
│       ├── context.ts      # tRPC context (auth)
│       └── index.ts        # Express app entry point
├── drizzle/                # Drizzle ORM schema + migrations
│   └── schema.ts           # Table definitions
├── shared/                 # Shared types and constants
│   └── _core/errors.ts     # HTTP error classes
├── vite.config.ts         # Vite + Tailwind CSS v4 config
├── package.json           # pnpm workspace
└── CLAUDE.md              # Claude Code guidance
```

## API (tRPC Procedures)

All API calls go through `/api/trpc/` as tRPC procedures:

- `auth.me` / `auth.logout`
- `equipment.list/getById/create/update/delete`
- `maintenance.list/getById/create/update/delete`
- `inventory.list/getById/lowStock/create/update/delete`
- `workOrders.list/getById/create/update/delete`
- `dashboard.stats`

## Database Schema

Tables: `users`, `equipment`, `maintenance`, `inventory`, `workOrders`. See `drizzle/schema.ts` for full MySQL/Drizzle definitions.

## License

MIT
