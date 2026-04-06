# GEMINI.md - Project Context & Instructions

This file provides critical context and instructions for AI agents working on the Biomedical Department ERP System. It takes precedence over general defaults.

## 🚀 Project Overview
A specialized ERP system for hospital biomedical departments to manage equipment lifecycles, maintenance, inventory, and staff work orders.

- **Stack**: React 19 (Frontend) + Express.js & tRPC 11 (Backend) + Drizzle ORM (Database).
- **Database**: MySQL/TiDB.
- **Auth**: Manus OAuth with Role-Based Access Control (Admin/User).
- **UI**: Tailwind CSS 4, shadcn/ui, Lucide icons, Recharts.

## 🏗️ Architecture & Directory Structure

### Core Components
- `client/src/`: React frontend application.
  - `pages/`: Primary views (Dashboard, Equipment, Maintenance, Inventory, WorkOrders, QRScanner).
  - `components/`: Layouts and shared UI components (shadcn/ui in `components/ui/`).
  - `lib/trpc.ts`: tRPC client setup.
- `server/`: Express + tRPC backend.
  - `routers.ts`: API procedure definitions (The "API surface").
  - `db.ts`: Database query abstraction layer using Drizzle.
  - `_core/`: Infrastructure (Auth, Middleware, Vite setup, OAuth).
- `drizzle/`: Database schema and migrations.
  - `schema.ts`: Single source of truth for the database structure.
- `shared/`: Shared types and constants used by both client and server.

### Key Workflows
1. **API Development**: Define procedures in `server/routers.ts`. Use `protectedProcedure` for authenticated routes.
2. **Database Updates**: Modify `drizzle/schema.ts`, then run `pnpm db:push`.
3. **Data Access**: Add query functions in `server/db.ts` to keep `routers.ts` clean.
4. **Frontend Consumption**: Use `trpc.[module].[procedure].useQuery()` or `useMutation()` in React components.

## 🛠️ Development & Build Commands
```bash
pnpm install          # Install dependencies
pnpm dev              # Start development server (auto-detects port, default 3000)
pnpm build            # Build frontend (Vite) and backend (esbuild)
pnpm start            # Run production server from dist/
pnpm test             # Run Vitest tests
pnpm check            # TypeScript type checking
pnpm db:push          # Sync schema changes to database
pnpm format           # Format code with Prettier
```

## 📏 Coding Conventions & Standards

### Frontend
- **Routing**: Use `wouter` for lightweight routing (configured in `client/src/App.tsx`).
- **State Management**: Primarily via `@tanstack/react-query` (via tRPC). Use React Context for UI state (e.g., `ThemeContext`).
- **Styling**: Tailwind CSS 4 utility classes. Prefer standard shadcn/ui patterns.
- **Icons**: Use `lucide-react`.

### Backend
- **Type Safety**: Ensure all tRPC inputs are validated with `zod`.
- **Permissions**: Admin-only routes must check `ctx.user.role === 'admin'`.
- **Database**: Use Drizzle's camelCase column naming to match TypeScript conventions.

### Testing
- Place test files in `server/*.test.ts`.
- Use `vitest` for unit and integration testing of tRPC procedures.

## 📋 Module Responsibilities
- **Equipment**: Registry, specifications, status tracking, and QR code generation.
- **Maintenance**: Preventive/corrective scheduling and history.
- **Inventory**: Spare parts tracking with low-stock thresholds and alerts.
- **Work Orders**: Task assignment, priority management, and status tracking.
- **Dashboard**: Real-time analytics and summary metrics using Recharts.
- **QR Scanner**: Mobile-optimized camera interface for equipment lookup.

## 🔐 Environment Variables
Required in `.env.local`:
- `DATABASE_URL`: MySQL connection string.
- `VITE_APP_ID`, `JWT_SECRET`, `OWNER_OPEN_ID`: Auth configuration.
- `OAUTH_SERVER_URL`: `https://api.manus.im`.
