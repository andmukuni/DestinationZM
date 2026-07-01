# DestinationZM

Tour and travel agency admin platform built with **AdonisJS 7**, **Inertia.js**, and **React 19**.

## Stack

- AdonisJS 7 + Lucid ORM
- Inertia.js + React 19 + TypeScript
- Tailwind CSS v4
- MySQL (XAMPP / MariaDB)
- Redis (optional, for sidebar/permission caching)

## Quick start

```bash
cd /Users/majormacs/Projects/DestinationZM
nvm use 24
npm install
cp .env.example .env
# Create database: mysql -u root -e "CREATE DATABASE DestinationZM;"
node ace migration:run
node ace db:seed
npm run dev
```

Open http://localhost:3333

**Default password for all dev users:** `password123`

## Department logins

| Department | Email | Role |
|---|---|---|
| System Administrator | admin@destinationzm.local | Full access |
| Finance Department | finance@destinationzm.local | Invoices, receipts, payments, reports |
| Reservations Team | reservations@destinationzm.local | Bookings, quotations, customers |
| Operations Team | operations@destinationzm.local | Suppliers, bookings (read) |
| Recovery Officers | recovery@destinationzm.local | Recovery schedules, payments |
| Management | management@destinationzm.local | Cross-module read, reports |
| Executive Users | executive@destinationzm.local | Dashboard, executive reports |

## Modules

| Module | Route | Status |
|---|---|---|
| Dashboard | `/dashboard` | Live KPIs from database |
| Bookings | `/bookings` | CRUD + confirm + documents |
| Customers | `/customers` | CRUD |
| Quotations | `/quotations` | CRUD + approve |
| Suppliers | `/suppliers` | CRUD |
| Documents | `/documents` | Upload, library, download |
| Invoices | `/invoices` | CRUD + issue + document |
| Receipts | `/receipts` | Record payments |
| Payments | `/payments` | Payment ledger |
| Recovery | `/recovery` | Queue, assign, follow-up |
| Reports | `/reports` | System + Excel export |
| Users & roles | `/users`, `/roles` | RBAC for 7 departments |
| Packages, destinations, offices, agents | — | Coming soon |

## Roles

Seven department roles replace the original manager/travel_agent model. Permissions are configurable at `/roles` (admin only).

Branch-required roles: **Reservations**, **Operations**, **Recovery**.

## Development

```bash
npm run dev        # Start dev server with HMR (Node 24+)
npm run typecheck  # TypeScript check
npm run lint       # ESLint
npm run build      # Production build
```
