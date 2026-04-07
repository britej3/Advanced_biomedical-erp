# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Biomedical Department ERP System - A full-stack hospital equipment management application with React frontend, Express/tRPC backend, and MySQL database via Drizzle ORM.

## Common Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Start development server (port 3000 default, auto-finds available port)
pnpm build            # Build for production (Vite + esbuild)
pnpm start            # Run production server
pnpm test             # Run vitest tests
pnpm check            # TypeScript type checking
pnpm format           # Format code with prettier
pnpm db:push          # Generate and run database migrations
```

## Architecture

### Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS 4 + Vite
- **Backend**: Express.js + tRPC 11 (type-safe API)
- **Database**: MySQL/TiDB with Drizzle ORM
- **Auth**: Manus OAuth (requires `VITE_APP_ID`, `JWT_SECRET`, `OWNER_OPEN_ID`)
- **UI**: shadcn/ui + Radix UI components in `client/src/components/ui/`

### Directory Structure

```
client/src/
├── pages/           # Route components (Dashboard, Equipment, Maintenance, Inventory, WorkOrders, QRScanner)
├── components/      # Shared components (DashboardLayout, Sidebar, QRCodeDisplay, ui/)
├── lib/trpc.ts      # tRPC client setup
├── contexts/        # React contexts (ThemeContext)
├── hooks/           # Custom React hooks
└── App.tsx          # Wouter routing setup

server/
├── _core/           # Framework infrastructure (auth, tRPC setup, OAuth)
├── routers.ts       # All tRPC procedures (equipment, maintenance, inventory, workOrders, dashboard)
├── db.ts            # Database query functions (Drizzle ORM)
└── *.test.ts        # Vitest tests

drizzle/
├── schema.ts        # Database schema definitions (users, equipment, maintenance, inventory, workOrders)
└── migrations/      # SQL migration files

shared/
├── types.ts         # Type exports
└── const.ts         # Shared constants
```

### Key Patterns

**tRPC API Layer**: All API calls go through tRPC routers defined in `server/routers.ts`. Each domain (equipment, maintenance, inventory, workOrders) has its own router with CRUD procedures. Admin-only operations check `ctx.user.role === 'admin'`.

**Database Queries**: All database operations in `server/db.ts` use Drizzle ORM with lazy connection initialization. Tables defined in `drizzle/schema.ts`.

**Frontend Data Fetching**: Uses `@trpc/react-query` with the `trpc` client from `client/src/lib/trpc.ts`. Example: `trpc.equipment.list.useQuery()`.

**Route Protection**: Uses `protectedProcedure` in tRPC routers. Unauthorized users get UNAUTHORIZED error; non-admins get FORBIDDEN for admin-only operations.

**Role-Based Access**:

- Admin: Full CRUD access to all modules
- User: Can view and update assigned tasks, limited access

## Database Schema

5 tables with foreign key relationships:

- `users`: Manus OAuth users (openId, role: user/admin)
- `equipment`: Biomedical devices (name, model, serialNumber, location, status)
- `maintenance`: Maintenance records (type: preventive/corrective/inspection, status, equipmentId)
- `inventory`: Spare parts (partNumber, quantity, threshold for low-stock alerts)
- `workOrders`: Task assignments (priority: low/medium/high/urgent, status, assignedTo, createdBy)

All tables have `createdAt` and `updatedAt` timestamps managed by Drizzle.

## Adding New Features

1. Update schema in `drizzle/schema.ts` if needed
2. Run `pnpm db:push` to generate and apply migrations
3. Add query functions in `server/db.ts`
4. Add tRPC procedures in `server/routers.ts`
5. Create UI in `client/src/pages/` or `client/src/components/`
6. Add route in `client/src/App.tsx`
7. Add navigation item in `client/src/components/Sidebar.tsx`
8. Write tests in `server/*.test.ts`

## Required Environment Variables

```
DATABASE_URL=mysql://user:pass@host:3306/db
VITE_APP_ID=<manus-oauth-app-id>
JWT_SECRET=<random-32-char-string>
OWNER_OPEN_ID=<your-manus-openid>
OAUTH_SERVER_URL=https://api.manus.im
```

## Testing

Tests use Vitest with node environment. Test files in `server/*.test.ts`. Example pattern:

```typescript
import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

describe("feature", () => {
  it("does something", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.equipment.list();
    expect(result).toBeDefined();
  });
});
```
