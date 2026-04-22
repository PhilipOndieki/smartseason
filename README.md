# SmartSeason

A full-stack crop field monitoring platform. Admins create and assign fields to agents. Agents submit field updates with crop stage and risk flags. The system automatically computes field health status and surfaces everything through a role-scoped dashboard.

**Live API:** https://smartseason-7ukd.onrender.com
**Live App:** https://smartseason-olive.vercel.app
**API Docs:** https://smartseason-7ukd.onrender.com/api-docs

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Local Development Setup](#local-development-setup)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [Authentication & Roles](#authentication--roles)
- [Server — API Reference](#server--api-reference)
- [Client — Application Pages](#client--application-pages)
- [Status & Stage Logic](#status--stage-logic)
- [Role-Based Access Control](#role-based-access-control)
- [Deployment](#deployment)
- [Demo Credentials](#demo-credentials)
- [Postman Testing Guide](#postman-testing-guide)

---

## Architecture Overview

```
Browser (React/Vite)
        │
        │  HTTPS / JWT Bearer
        ▼
Render (Express API)  ──────►  Railway (MySQL Cloud DB)
```

The client is a React SPA deployed on Vercel. All data lives in a MySQL database hosted on Railway. The Express API on Render handles authentication, business logic, and status computation. Every request from the client that hits a protected route must carry a JWT in the `Authorization: Bearer` header.

---

## Tech Stack

### Server
| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express.js |
| Database | MySQL 8 via mysql2 connection pool |
| Authentication | JWT (jsonwebtoken) + bcryptjs |
| Cloud DB | Railway MySQL |
| API Docs | Swagger UI (swagger-jsdoc + swagger-ui-express) |
| Deployment | Render |

### Client
| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build Tool | Vite 8 |
| Routing | React Router v7 |
| HTTP Client | Axios |
| Styling | Tailwind CSS v3 |
| Font | Inter (Google Fonts) |
| Deployment | Vercel |

---

## Project Structure

```
smartseason/
├── .github/
│   └── workflows/
│       └── smartseason-ci-cd.yml       # GitHub Actions: build + Vercel deploy
│
├── client/                             # React frontend
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js                # Axios instance with JWT interceptor
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── FieldCard.jsx           # Field summary card
│   │   │   ├── Navbar.jsx              # Top navigation bar (role-aware)
│   │   │   ├── ProtectedRoute.jsx      # Route guards (ProtectedRoute + AdminRoute)
│   │   │   ├── StageBadge.jsx          # Crop stage pill badge
│   │   │   └── StatusBadge.jsx         # Field status indicator with dot
│   │   ├── context/
│   │   │   └── AuthContext.jsx         # Auth state, token decode, login/logout
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx           # Role-scoped overview
│   │   │   ├── FieldDetail.jsx         # Single field + update history + forms
│   │   │   ├── Fields.jsx              # Admin: all fields table
│   │   │   ├── Landing.jsx             # Public landing page
│   │   │   ├── Login.jsx               # Login form
│   │   │   ├── MyFields.jsx            # Agent: own assigned fields
│   │   │   ├── NewField.jsx            # Admin: create field form
│   │   │   ├── Register.jsx            # Registration form
│   │   │   └── Users.jsx               # Admin: user management
│   │   ├── App.jsx                     # Router config
│   │   ├── index.css                   # Tailwind directives + Inter font
│   │   └── main.jsx                    # Entry point, wraps in AuthProvider
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── server/                             # Express API
    ├── database/
    │   └── schema.sql                  # MySQL table definitions
    ├── postman/
    │   └── smartseason.postman_collection.json
    ├── src/
    │   ├── config/
    │   │   ├── db.js                   # mysql2 connection pool
    │   │   └── swagger.js              # Swagger spec config
    │   ├── docs/
    │   │   └── swagger.yaml            # Full OpenAPI 3.0 spec
    │   ├── middleware/
    │   │   ├── auth.js                 # JWT verification middleware
    │   │   └── roles.js                # requireRole() factory middleware
    │   └── modules/
    │       ├── auth/                   # Register, login, user management
    │       ├── fields/                 # CRUD + assign + status sync
    │       ├── updates/                # Submit, edit, delete field updates
    │       └── dashboard/              # Role-scoped summary stats
    ├── .env.example
    ├── package.json
    └── server.js                       # Binds app to port
```

---

## Local Development Setup

### Prerequisites

- Node.js 18+
- MySQL 8+ running locally

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd smartseason

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Configure environment variables

```bash
cd server
cp .env.example .env
# Fill in your local MySQL credentials and a JWT secret (see Environment Variables below)
```

Create `client/.env` (already in repo, update if needed):

```bash
VITE_API_URL=http://localhost:5000
```

### 3. Provision the database

```bash
mysql -u root -p < server/database/schema.sql
```

### 4. Start both servers

In one terminal:

```bash
cd server && npm run dev     # API on http://localhost:5000
```

In another:

```bash
cd client && npm run dev     # Frontend on http://localhost:5173
```

The API root at `http://localhost:5000` returns a JSON index of all available endpoints.

---

## Environment Variables

### Server (`server/.env`)

| Variable | Description |
|---|---|
| `PORT` | Port to run the API on (default: 5000) |
| `DB_HOST` | MySQL host |
| `DB_PORT` | MySQL port (default: 3306) |
| `DB_USER` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | Database name |
| `JWT_SECRET` | Secret for signing JWTs — must be strong and never committed |
| `NODE_ENV` | `development` or `production` |

Generate a strong JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Client (`client/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the Express API |

For local development use `http://localhost:5000`. For production builds set this to `https://smartseason-7ukd.onrender.com` (or configure via a Vercel environment variable / GitHub secret).

---

## Database Schema

Three tables power the system.

### `users`

Stores all admin and agent accounts.

| Column | Type | Notes |
|---|---|---|
| `id` | INT PK AUTO_INCREMENT | |
| `name` | VARCHAR(100) | |
| `email` | VARCHAR(150) UNIQUE | |
| `password_hash` | VARCHAR(255) | bcrypt, 12 rounds |
| `role` | ENUM('admin', 'agent') | Default: agent |
| `is_super` | TINYINT(1) | Set to 1 for the primary admin (id = 1) |
| `created_at` | TIMESTAMP | |

### `fields`

Stores every crop field.

| Column | Type | Notes |
|---|---|---|
| `id` | INT PK AUTO_INCREMENT | |
| `name` | VARCHAR(100) | |
| `crop_type` | VARCHAR(100) | |
| `planting_date` | DATE | |
| `current_stage` | ENUM('planted','growing','ready','harvested') | Default: planted |
| `status` | ENUM('active','at_risk','completed') | Default: active |
| `assigned_agent_id` | INT FK → users.id | ON DELETE SET NULL |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP |

### `field_updates`

Stores every update submitted by an agent.

| Column | Type | Notes |
|---|---|---|
| `id` | INT PK AUTO_INCREMENT | |
| `field_id` | INT FK → fields.id | ON DELETE CASCADE |
| `agent_id` | INT FK → users.id | ON DELETE CASCADE |
| `stage` | ENUM('planted','growing','ready','harvested') | |
| `notes` | TEXT | |
| `risk_flags` | JSON | Array of risk flag strings |
| `created_at` | TIMESTAMP | |

---

## Authentication & Roles

Authentication is JWT-based. On login or register the server issues a 7-day signed token. The client stores it in `localStorage` under the key `smartseason_token` and attaches it to every request via an Axios request interceptor.

```
Authorization: Bearer <token>
```

If a 401 is returned, the Axios response interceptor clears the token and redirects to `/login`.

The JWT payload contains:

```json
{
  "id": 1,
  "name": "James Admin",
  "email": "admin@smartseason.com",
  "role": "admin",
  "is_super": 1
}
```

`AuthContext` decodes this payload client-side (no separate `/me` endpoint needed) and exposes `user`, `token`, `isAdmin`, `login()`, and `logout()` to all components via React context.

### Roles

| Role | What they can do |
|---|---|
| `admin` | Full access: create/edit/delete fields, assign agents, view all fields and updates, manage user roles, view admin dashboard |
| `agent` | View only their assigned fields, submit/edit/delete their own updates, view agent dashboard |

The `is_super` flag on the primary admin (user id 1) prevents that account from being demoted and allows demoting other admins — only the super admin can downgrade another admin to agent.

---

## Server — API Reference

All protected endpoints require `Authorization: Bearer <token>`.

### Auth

#### `POST /auth/register`

Register a new user. Note: the `role` field in the request body is accepted but always overridden to `agent` for security. Role changes must go through the admin user management endpoint.

**Request:**
```json
{
  "name": "Grace Wanjiru",
  "email": "agent@smartseason.com",
  "password": "Agent1234",
  "role": "agent"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "token": "<jwt>",
    "user": { "id": 2, "name": "Grace Wanjiru", "email": "agent@smartseason.com", "role": "agent" }
  }
}
```

---

#### `POST /auth/login`

**Request:**
```json
{ "email": "admin@smartseason.com", "password": "Admin1234" }
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "token": "<jwt>",
    "user": { "id": 1, "name": "James Admin", "email": "admin@smartseason.com", "role": "admin", "is_super": 1 }
  }
}
```

---

#### `GET /auth/agents` — Admin only

Returns all users with the `agent` role. Used to populate agent dropdowns in the create/edit field forms.

---

#### `GET /auth/users` — Admin only

Returns all registered users ordered by `created_at` descending.

---

#### `PATCH /auth/users/:id/role` — Admin only

Changes a user's role between `admin` and `agent`. The super admin cannot be demoted. A regular admin cannot demote another admin — only the super admin can.

**Request:**
```json
{ "role": "agent" }
```

---

### Fields

#### `POST /fields` — Admin only

Creates a new field. `name` is required. `assigned_agent_id` must reference a user with `role = 'agent'`.

**Request:**
```json
{
  "name": "North Block A",
  "crop_type": "Maize",
  "planting_date": "2026-03-01",
  "assigned_agent_id": 2
}
```

---

#### `GET /fields`

Returns fields scoped by role. Admins get all fields with the assigned agent name joined. Agents get only their assigned fields. Triggers live staleness recomputation for every non-completed field (see Status Logic).

---

#### `GET /fields/:id`

Returns a single field with its full update history. Agents are 403'd if the field is not assigned to them. Also triggers a live staleness check.

---

#### `PATCH /fields/:id` — Admin only

Updates field metadata: `name`, `crop_type`, `planting_date`. Does not change assignment (use `/assign` for that).

---

#### `PATCH /fields/:id/assign` — Admin only

Reassigns a field to a different agent. The target user must have `role = 'agent'`. Historical updates from the previous agent are preserved.

**Request:**
```json
{ "agent_id": 3 }
```

---

#### `DELETE /fields/:id` — Admin only

Deletes the field and cascades to all its `field_updates`.

---

### Updates

#### `POST /updates` — Assigned agent only

Submits a field update. Only the agent currently assigned to the field may submit. After insert, recomputes and syncs `current_stage` and `status` on the parent field row.

**Request:**
```json
{
  "field_id": 1,
  "stage": "growing",
  "notes": "Good canopy cover, no signs of stress",
  "risk_flags": []
}
```

With risk flags:
```json
{
  "field_id": 1,
  "stage": "growing",
  "notes": "Spotted aphid clusters on lower leaves",
  "risk_flags": ["pest_infestation"]
}
```

---

#### `GET /updates/field/:field_id`

Returns all updates for a field ordered by `created_at` descending. Admins can access any field. Agents can only access their assigned fields.

---

#### `PATCH /updates/:id` — Update owner only

Allows the agent who submitted an update to edit `stage`, `notes`, and `risk_flags`. Re-syncs the parent field status after the edit.

---

#### `DELETE /updates/:id` — Update owner only

Deletes an update. Re-syncs the parent field stage and status to the next most recent remaining update, or resets to `planted` / `active` if no updates remain.

---

### Dashboard

#### `GET /dashboard`

Returns summary data scoped by role.

**Admin response:**
```json
{
  "total_fields": 12,
  "status_breakdown": { "active": 7, "at_risk": 3, "completed": 2 },
  "fields_by_stage": { "planted": 2, "growing": 5, "ready": 3, "harvested": 2 },
  "recent_updates": [ { "id": 5, "stage": "ready", "field_name": "South Block C", "agent_name": "Grace Wanjiru", "created_at": "..." } ]
}
```

**Agent response:**
```json
{
  "assigned_fields": 3,
  "status_breakdown": { "active": 2, "at_risk": 1, "completed": 0 },
  "recent_updates": [ { "id": 5, "stage": "ready", "field_name": "South Block C", "created_at": "..." } ]
}
```

---

### Valid Values

**Risk flags:**

| Flag | Meaning |
|---|---|
| `pest_infestation` | Crop affected by pests |
| `disease_outbreak` | Disease detected |
| `drought_stress` | Drought stress signs |
| `waterlogging` | Excess water |
| `nutrient_deficiency` | Visible deficiency signs |

**Stages (in order):** `planted` → `growing` → `ready` → `harvested`

---

## Client — Application Pages

### Public

#### `/` — Landing

Full-screen farm background with a hero call-to-action. Navbar transitions from transparent to white on scroll. Links to `/login` and `/register`.

#### `/login` — Login

Email and password form. On success, decodes the JWT to determine role and redirects: admins go to `/fields`, agents go to `/dashboard`.

#### `/register` — Register

Same flow as login. All new registrations receive the `agent` role. Role can be upgraded later by an admin through the Users page.

---

### Protected (any authenticated user)

#### `/dashboard` — Dashboard

Renders `AdminDashboard` or `AgentDashboard` based on role.

- **Admin:** stat cards (total fields, active, at risk, completed), recent updates table, fields-by-stage breakdown.
- **Agent:** stat cards (assigned fields, at risk, completed), recent updates table, prompt to contact coordinator if no fields are assigned.

#### `/fields/:id` — Field Detail

Available to both roles. Shows field metadata in a left panel and update history in a right panel. The layout:

- **Admin view:** field info with an Edit button that opens `EditFieldModal` (edits name, crop type, planting date, and agent assignment inline).
- **Agent view (assigned to this field):** same history view, plus Edit/Delete controls on each update they submitted, and an `UpdateForm` at the bottom to submit new updates with stage, notes, and risk flags.

If an agent tries to access a field they are not assigned to, they are redirected to `/dashboard`.

#### `/my-fields` — My Fields (agents)

Agent's assigned fields in a searchable, filterable table. Filters: status (all/active/at_risk/completed), stage (all/planted/growing/ready/harvested), and a text search on field name or crop type. Summary strip at the top shows active/at_risk/completed counts.

---

### Admin Only

#### `/fields` — All Fields

Full fields table with columns for name, crop type, stage (StageBadge), status (StatusBadge with dot), assigned agent, planting date. Each row has View and Delete actions.

#### `/fields/new` — New Field

Form to create a field. Loads available agents from `GET /auth/agents` into a dropdown. Redirects to `/fields` on success.

#### `/users` — User Management

Table of all registered users showing name, email, role badge, and join date. Each row has a role-toggle button (Make Admin / Make Agent) — disabled for the current user, the super admin, and (for non-super admins) other admins.

---

### Components

| Component | Purpose |
|---|---|
| `Navbar` | Top bar with SmartSeason logo and role-aware nav links. Admins see Fields and Users; agents see My Fields. Both see Dashboard and Sign Out. |
| `ProtectedRoute` | Redirects to `/login` if no token is present. |
| `AdminRoute` | Redirects to `/login` if unauthenticated or to `/dashboard` if the user is not an admin. |
| `StatusBadge` | Coloured dot + label for `active` (green), `at_risk` (amber), `completed` (grey). |
| `StageBadge` | Grey pill with the stage name, capitalized. |
| `FieldCard` | Compact card used for field listings with name, crop type, stage, status, and a View link. |

---

### API Client (`src/api/axios.js`)

A shared Axios instance pre-configured with:

- `baseURL` from `VITE_API_URL`
- A request interceptor that reads `smartseason_token` from localStorage and injects `Authorization: Bearer <token>`
- A response interceptor that catches 401s, clears the token, and hard-redirects to `/login`

---

## Status & Stage Logic

### Stage

Stages are set explicitly by the agent with each update submission. The parent `fields.current_stage` is overwritten to match the latest submitted stage.

```
planted → growing → ready → harvested
```

### Status (computed automatically)

After every update (create, edit, or delete), the API recomputes field status using this pure function in `updates.service.js`:

```
1. If stage === 'harvested'   →  completed
2. If any risk_flag is set    →  at_risk
3. If field.updated_at > 14 days ago and not harvested  →  at_risk
4. Otherwise                  →  active
```

Additionally, a **live staleness check** runs on every read in `fields.service.js`. When `getAllFields` or `getFieldById` is called, every non-completed field is checked for the 14-day inactivity threshold and updated in-place if stale. This means a field never stays visually active while sitting unmonitored for two weeks.

---

## Role-Based Access Control

### Server-side enforcement

Route protection is layered:

1. `authenticate` middleware — verifies the JWT and attaches `req.user`
2. `requireRole('admin')` — factory middleware that returns 403 if `req.user.role !== 'admin'`

Additional business-rule checks happen in the service layer:

- Agents can only read/update fields assigned to them
- Agents can only edit/delete updates they submitted
- The super admin cannot be demoted
- Only the super admin can demote other admins

### Client-side enforcement

Route guards in `ProtectedRoute.jsx`:

- `ProtectedRoute` — any authenticated user; unauthenticated → `/login`
- `AdminRoute` — authenticated admin only; non-admin → `/dashboard`

The `isAdmin` flag from `AuthContext` (derived from `user.role === 'admin'` in the decoded JWT) gates admin-only UI elements like the Edit button on field detail, Make Admin/Agent buttons on users, and the New Field button.

> Client-side guards are UX only — all access control is enforced server-side.

---

## Deployment

### Architecture

```
GitHub → GitHub Actions (build check) → Vercel (client) 
GitHub → push to main → Render (server, auto-deploy)
                              │
                              └─► Railway MySQL (cloud DB)
```

### CI/CD (GitHub Actions)

Defined in `.github/workflows/smartseason-ci-cd.yml`. Triggers on pushes to `main` that touch `client/**`. Steps:

1. Setup Node.js 20 with npm cache
2. `npm install` in `client/`
3. `npm run build` with `VITE_API_URL` injected from GitHub secrets
4. Upload `dist/` as an artifact (retained 7 days)
5. Log Vercel deployment URL (Vercel GitHub integration handles the actual deploy automatically)

### Client — Vercel

1. Connect the GitHub repo to a new Vercel project
2. Set **Root Directory** to `client`
3. Set environment variable `VITE_API_URL` to your Render API URL
4. Vercel auto-deploys on every push to `main`

### Server — Render

1. Create a new Render Web Service and connect the GitHub repo
2. Set **Root Directory** to `server`
3. Set **Build Command** to `npm install`
4. Set **Start Command** to `node server.js`
5. Add all environment variables from `server/.env.example`
6. Render auto-deploys on every push to `main`

### Database — Railway MySQL

1. Create a new MySQL service on [railway.app](https://railway.app)

2. Once provisioned, open the service and go to the **Variables** tab. Railway exposes a `DATABASE_URL` in this format:

```
mysql://root:<password>@<host>.railway.app:<port>/railway
```

For example:
```
mysql://root:sUp3rS3cr3t@monorail.proxy.rlwy.net:31045/railway
```

3. Extract the individual values and add them to your Render environment variables:

| Variable | From the example URL |
|---|---|
| `DB_HOST` | `monorail.proxy.rlwy.net` |
| `DB_PORT` | `31045` |
| `DB_USER` | `root` |
| `DB_PASSWORD` | `sUp3rS3cr3t` |
| `DB_NAME` | `railway` |

4. Run the schema against the Railway MySQL instance:

```bash
mysql -h monorail.proxy.rlwy.net -P 31045 -u root -p railway < server/database/schema.sql
```

> **Note:** Railway provisions a default database called `railway`. Remove the `CREATE DATABASE` line from `schema.sql` before running it, or the command will fail — run the `CREATE TABLE` statements directly against the `railway` database.
```

### Health Check

```
GET https://smartseason-7ukd.onrender.com/health
→ { "status": "ok" }
```

---

## Demo Credentials

These accounts must be seeded or registered before use. Register via `POST /auth/register`, then manually set roles in the database if needed.

| Role | Email | Password |
|---|---|---|
| Admin (super) | admin@smartseason.com | Admin1234 |
| Agent | agent@smartseason.com | Agent1234 |

---

## Postman Testing Guide

Import `server/postman/smartseason.postman_collection.json` via **File → Import**.

Set collection variables:

| Variable | Value |
|---|---|
| `smartadmintoken` | Token from admin login response |
| `smartagenttoken` | Token from agent login response |

Use `{{baseUrl}}` set to `http://localhost:5000` for local or `https://smartseason-7ukd.onrender.com` for production.

### End-to-end test flow

1. `POST /auth/register` — register admin
2. `POST /auth/register` — register agent
3. `POST /auth/login` (admin) — copy token to `smartadmintoken`
4. `POST /fields` — create a field, assign to agent id 2
5. `GET /fields` — verify field appears
6. `GET /fields/1` — inspect field with update history
7. `POST /auth/login` (agent) — copy token to `smartagenttoken`
8. `POST /updates` — submit a healthy update
9. `POST /updates` — submit an at-risk update with `risk_flags: ["pest_infestation"]`
10. `GET /updates/field/1` — verify both updates
11. `PATCH /fields/1/assign` — reassign field to a different agent
12. `DELETE /fields/2` — delete a field
13. `GET /dashboard` (admin token) — verify stats
14. `GET /dashboard` (agent token) — verify agent view

---

## Design Decisions

**No ORM** — Raw SQL via mysql2 keeps queries explicit, readable, and easy to debug without magic.

**Connection pool** — Handles concurrent requests without queuing under load. Pool size of 10 is sufficient for current scale.

**Module structure** — Each feature (auth, fields, updates, dashboard) is self-contained with its own routes, controller, and service. Adding a new feature means adding a new folder, not touching existing code.

**Pure status function** — `computeFieldStatus()` in `updates.service.js` has no database dependency. It takes a field row and a latest update object and returns the new status string, making it independently testable.

**Live staleness check at read time** — Rather than a cron job, staleness is recomputed inline when fields are fetched. Avoids scheduling complexity and ensures the UI never shows stale-but-active fields.

**Role factory middleware** — `requireRole('admin')` keeps route definitions clean. `router.patch('/:id', requireRole('admin'), controller.updateField)` reads as a self-documenting access control declaration.

**JWT 7-day expiry** — Long enough for field agents working remotely without re-authentication, short enough to limit exposure if a token is leaked.

**Client-side JWT decode** — The token payload contains enough user info (id, name, email, role, is_super) that no separate `/auth/me` round-trip is needed. `AuthContext` decodes on load and hydrates user state instantly.

**Axios interceptors** — Centralize auth header injection and 401 handling in one place. No individual page needs to think about token management.