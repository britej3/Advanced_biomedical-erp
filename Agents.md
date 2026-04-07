# Agents.md - AI Agent Guide

This document provides a consolidated technical reference and operational guide for AI agents (like Gemini, Claude, etc.) working on the Biomedical Department ERP System.

## 🚀 Project Overview

A comprehensive hospital equipment management system.

- **Frontend**: React 19 (TypeScript, Tailwind CSS 4, Vite, Wouter)
- **Backend**: Express.js + tRPC 11 (End-to-end type safety)
- **Database**: MySQL/TiDB via Drizzle ORM
- **Authentication**: Manus OAuth (Role-based: Admin/User)

## 🏗️ Technical Architecture

### Directory Map

- `client/`: React application.
  - `src/pages/`: Module views (Dashboard, Equipment, etc.)
  - `src/components/ui/`: shadcn/ui components.
  - `src/lib/trpc.ts`: API client configuration.
- `server/`: Express + tRPC backend.
  - `routers.ts`: API definitions and logic.
  - `db.ts`: Drizzle database interaction layer.
- `drizzle/`: Database management.
  - `schema.ts`: Single source of truth for DB structure.
- `shared/`: Shared TypeScript types and constants.

### Core Workflows

1. **API Calls**: Always use tRPC. Procedures are defined in `server/routers.ts` and called via `trpc.[module].[procedure].useQuery/useMutation` on the frontend.
2. **Database Changes**:
   - Edit `drizzle/schema.ts`.
   - Run `pnpm db:push` to sync with the local/dev database.
3. **Auth/Permissions**: Role checks happen in `server/routers.ts` using `ctx.user.role`.

## 🛠️ Development Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Start full-stack dev environment
pnpm test             # Run backend vitest tests
pnpm check            # Type checking
pnpm db:push          # Sync database schema
```

## 📋 Project Status (from todo.md)

The core ERP functionality is largely **Complete**:

- [x] Infrastructure & Auth (Manus OAuth)
- [x] Dashboard with Recharts
- [x] Equipment CRUD & QR Code Tracking
- [x] Maintenance Scheduling
- [x] Inventory Management & Low-stock Alerts
- [x] Work Orders & Staff Assignment
- [x] Role-Based Access Control (RBAC)

**Next Steps/Focus**:

- Maintenance and bug fixing.
- Enhancing the QR Scanner utility.
- Performance optimization and production scaling.

## 🌐 Deployment & Environment

- **Hosting**: Optimized for **Vercel**.
- **Build Output**: `dist/` directory.
- **Critical Env Vars**:
  - `DATABASE_URL`: Connection string.
  - `VITE_APP_ID` / `JWT_SECRET`: Auth configuration.
  - `OWNER_OPEN_ID`: Administrative user link.

## 🤖 Agent Guidelines

- **UI Consistency**: Use `shadcn/ui` components located in `client/src/components/ui/`.
- **Type Safety**: Maintain strict TypeScript adherence across the `shared/`, `client/`, and `server/` boundaries.
- **Testing**: Add new tests in `server/*.test.ts` for any new tRPC logic.
- **Documentation**: Update `DATABASE_SCHEMA.md` if the schema changes.
