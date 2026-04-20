# SmartSeason Server

A production-ready REST API for crop field monitoring. Tracks fields across a growing season, assigns field agents, captures field updates and observations, and automatically computes field health status based on crop stage and risk flags.

**Live API:** https://smartseason-7ukd.onrender.com
**API Documentation:** https://smartseason-7ukd.onrender.com/api-docs

---

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** MySQL via mysql2 connection pool
- **Auth:** JWT (jsonwebtoken) + bcryptjs password hashing
- **Environment:** dotenv
- **CORS:** cors
- **Cloud Database:** Aiven MySQL (production)
- **Deployment:** Render (production)

---

## Project Structure

```
server/
├── src/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── roles.js
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.controller.js
│   │   │   └── auth.service.js
│   │   ├── fields/
│   │   │   ├── fields.routes.js
│   │   │   ├── fields.controller.js
│   │   │   └── fields.service.js
│   │   ├── updates/
│   │   │   ├── updates.routes.js
│   │   │   ├── updates.controller.js
│   │   │   └── updates.service.js
│   │   └── dashboard/
│   │       ├── dashboard.routes.js
│   │       ├── dashboard.controller.js
│   │       └── dashboard.service.js
│   └── app.js
├── database/
│   └── schema.sql
├── postman
│   └── smartseason.postman_collection.json
├── .env.example
├── server.js
└── README.md
```

---

## Local Setup

### Prerequisites

- Node.js 18+
- MySQL 8+ running locally

### Steps

```bash
# 1. Clone and install
git clone <repo-url>
cd smartseason-api
npm install

# 2. Copy env file and fill in your values
cp .env.example .env

# 3. Provision the local database
mysql -u root -p < database/schema.sql

# 4. Start development server
npm run dev
```

The API will be available at `http://localhost:5000`.

Opening `http://localhost:5000` in your browser shows all available endpoints.

---

## Environment Variables

| Variable      | Description                                          |
|---------------|------------------------------------------------------|
| `DB_HOST`     | MySQL host                                           |
| `DB_PORT`     | MySQL port (default: 3306)                           |
| `DB_USER`     | MySQL username                                       |
| `DB_PASSWORD` | MySQL password                                       |
| `DB_NAME`     | Database name                                        |
| `JWT_SECRET`  | Secret key for signing JWTs — keep this strong       |
| `NODE_ENV`    | `development` or `production`                        |

Generate a strong JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Database Schema

Three tables power the system:

**users** — stores all admin and agent accounts with bcrypt hashed passwords and role assignment.

**fields** — stores every crop field with name, crop type, planting date, current stage, computed status, and the assigned agent foreign key.

**field_updates** — stores every update submitted by an agent including stage, notes and risk flags stored as JSON.

### Running the schema on a fresh MySQL instance

```bash
mysql -u root -p < database/schema.sql
```

### Running the schema on Aiven (cloud)

Aiven uses SSL and does not allow creating new databases. Run the tables directly:

```bash
mysql -h <aiven-host> -P <aiven-port> -u avnadmin -p --ssl-mode=REQUIRED defaultdb -e "
CREATE TABLE IF NOT EXISTS users (...);
CREATE TABLE IF NOT EXISTS fields (...);
CREATE TABLE IF NOT EXISTS field_updates (...);
"
```

Or connect via MySQL Workbench with SSL mode set to REQUIRED and run the table definitions manually.

---

## Status Computation Logic

After every field update the API automatically computes the field status using this logic:

1. **`completed`** — if the submitted stage is `harvested`
2. **`at_risk`** — if the update contains any of the following risk flags: `pest_infestation`, `disease_outbreak`, `drought_stress`, `waterlogging`, `nutrient_deficiency` OR if the field has not been updated in more than 14 days and has not been harvested yet
3. **`active`** — everything else

The computed status and new stage are written back to the parent `fields` row immediately after the update is saved. The logic lives in `src/modules/updates/updates.service.js` as a pure function `computeFieldStatus()` making it easy to unit test independently.

---

## Field Lifecycle

```
planted → growing → ready → harvested
```

Stages are submitted by field agents via the updates endpoint. Each stage transition is recorded in `field_updates` with a timestamp, notes and optional risk flags.

---

## Demo Credentials

Register these via the API or use them directly if already seeded:

**Admin:**
- email: `admin@smartseason.com`
- password: `Admin1234`
- role: `admin`

**Field Agent:**
- email: `agent@smartseason.com`
- password: `Agent1234`
- role: `agent`

---

## Postman Testing Guide
A ready-to-use Postman collection is available in the `postman/` folder.
Import it directly into Postman via File > Import to have all endpoints pre-configured.



### Base URLs

Local:
```
http://localhost:5000
```

Production:
```
https://smartseason-7ukd.onrender.com
```

Set your base URL as a Postman collection variable called `baseUrl` and use `{{baseUrl}}` in all requests.

Save your JWT tokens as collection variables:
- `smartadmintoken` — token from admin login
- `smartagenttoken` — token from agent login

Use `Authorization: Bearer {{smartadmintoken}}` in the headers of protected requests.

---

### Auth Endpoints

#### POST /auth/register

```json
{
  "name": "James Admin",
  "email": "admin@smartseason.com",
  "password": "Admin1234",
  "role": "admin"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "token": "<jwt>",
    "user": { "id": 1, "name": "James Admin", "email": "admin@smartseason.com", "role": "admin" }
  }
}
```

---

#### POST /auth/login

```json
{
  "email": "admin@smartseason.com",
  "password": "Admin1234"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "token": "<jwt>",
    "user": { "id": 1, "name": "James Admin", "email": "admin@smartseason.com", "role": "admin" }
  }
}
```

---

### Fields Endpoints

All fields endpoints require `Authorization: Bearer <token>` header.

#### POST /fields (admin only)

```json
{
  "name": "North Block A",
  "crop_type": "Maize",
  "planting_date": "2026-03-01",
  "assigned_agent_id": 2
}
```

**Response 201:**
```json
{
  "success": true,
  "data": { "id": 1, "name": "North Block A", "crop_type": "Maize", "current_stage": "planted", "status": "active", ... }
}
```

---

#### GET /fields

Admin returns all fields with agent name joined. Agent returns only their assigned fields.

**Response 200:**
```json
{
  "success": true,
  "data": [ { "id": 1, "name": "North Block A", "agent_name": "Grace Wanjiru", ... } ]
}
```

---

#### GET /fields/:id

Returns a single field with its full update history.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "North Block A",
    "updates": [ { "id": 1, "stage": "growing", "notes": "...", "agent_name": "Grace Wanjiru", ... } ]
  }
}
```

---

#### PATCH /fields/:id/assign (admin only)

```json
{
  "agent_id": 3
}
```

**Response 200:**
```json
{
  "success": true,
  "data": { "id": 1, "assigned_agent_id": 3, ... }
}
```

---

#### DELETE /fields/:id (admin only)

**Response 200:**
```json
{
  "success": true,
  "message": "Field deleted"
}
```

---

### Updates Endpoints

Requires authentication. Only the agent assigned to a field can submit updates for it.

#### POST /updates

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

**Response 201:**
```json
{
  "success": true,
  "data": { "id": 1, "field_id": 1, "stage": "growing", "risk_flags": ["pest_infestation"], ... }
}
```

After this call the parent field status updates to `at_risk` automatically.

---

#### GET /updates/field/:field_id

Admin can access updates for any field. Agent can only access updates for their assigned fields.

**Response 200:**
```json
{
  "success": true,
  "data": [
    { "id": 2, "stage": "growing", "notes": "...", "agent_name": "Grace Wanjiru", ... }
  ]
}
```

---

### Dashboard Endpoint

Response varies by role.

#### GET /dashboard

**Admin response:**
```json
{
  "success": true,
  "data": {
    "total_fields": 12,
    "status_breakdown": { "active": 7, "at_risk": 3, "completed": 2 },
    "fields_by_stage": { "planted": 2, "growing": 5, "ready": 3, "harvested": 2 },
    "recent_updates": [
      { "id": 5, "stage": "ready", "field_name": "South Block C", "agent_name": "Grace Wanjiru", ... }
    ]
  }
}
```

**Agent response:**
```json
{
  "success": true,
  "data": {
    "assigned_fields": 3,
    "status_breakdown": { "active": 2, "at_risk": 1, "completed": 0 },
    "recent_updates": [ { "id": 5, "stage": "ready", "field_name": "South Block C", ... } ]
  }
}
```

---

### Valid Risk Flags

| Flag                  | Description                        |
|-----------------------|------------------------------------|
| `pest_infestation`    | Crop affected by pests             |
| `disease_outbreak`    | Disease detected in the field      |
| `drought_stress`      | Crop showing drought stress signs  |
| `waterlogging`        | Excess water in the field          |
| `nutrient_deficiency` | Visible nutrient deficiency signs  |

### Valid Stage Values

`planted` → `growing` → `ready` → `harvested`

---

## Production Deployment

### Architecture

```
Render (Node.js API) → Aiven (MySQL cloud database)
```

### Render Deployment

1. Push repo to GitHub
2. Go to render.com and create a new Web Service
3. Connect your GitHub repo
4. Set build command to `npm install`
5. Set start command to `node server.js`
6. Add all environment variables from `.env.example`
7. Render auto deploys on every push to main

### Aiven MySQL Setup

1. Sign up at aiven.io
2. Create a free MySQL service
3. Copy host, port, username, password and database name
4. Run the schema against Aiven using SSL:

```bash
mysql -h <host> -P <port> -u avnadmin -p --ssl-mode=REQUIRED defaultdb < database/schema.sql
```

Note: Aiven does not allow CREATE DATABASE commands. Run the table definitions directly against `defaultdb`.

### Health Check

```
GET https://smartseason-7ukd.onrender.com/health
```

Returns:
```json
{ "status": "ok" }
```

---

## Design Decisions

- **No ORM** — raw SQL via mysql2 keeps queries explicit, performant and easy to debug
- **Connection pool** — handles concurrent requests without queuing under load
- **Module structure** — each feature (auth, fields, updates, dashboard) is self contained with its own routes, controller and service
- **Pure status function** — `computeFieldStatus()` is a pure function with no DB dependency making it independently testable
- **Role middleware factory** — `requireRole('admin')` pattern keeps route definitions clean and readable
- **JWT 7 day expiry** — long enough for field agents working in the field without constant re-authentication

---

## Assumptions

- A field can only be assigned to one agent at a time
- Only the assigned agent can submit updates for a field
- Reassigning a field does not delete historical updates from the previous agent
- Risk flags are submitted as an array and stored as JSON in the database
- The 14 day staleness threshold for at_risk status is configurable by changing the value in `updates.service.js`