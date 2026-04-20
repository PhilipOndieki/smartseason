# SmartSeason API

A production-ready REST API for crop field monitoring — tracks fields, assigns agents, captures field updates, and automatically computes field health status based on crop stage and risk flags.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL (via mysql2 connection pool)
- **Auth:** JWT (jsonwebtoken) + bcryptjs
- **Environment:** dotenv
- **CORS:** cors

---

## Local Setup

### Prerequisites

- Node.js 18+
- MySQL 8+ running locally (or a Railway MySQL instance)

### Steps

```bash
# 1. Clone and install
git clone <repo-url>
cd smartseason-api
npm install

# 2. Copy env file and fill in your values
cp .env.example .env

# 3. Provision the database
mysql -u root -p < database/schema.sql

# 4. Start development server
npm run dev
```

The API will be available at `http://localhost:5000`.

---

## Railway MySQL Setup

1. Create a new project on [Railway](https://railway.app)
2. Add a **MySQL** plugin to the project
3. Copy the connection variables from the Railway MySQL plugin dashboard
4. In your Railway service, set the environment variables (see below)
5. To run the schema against Railway MySQL:

```bash
mysql -h <DB_HOST> -P <DB_PORT> -u <DB_USER> -p<DB_PASSWORD> < database/schema.sql
```

Or use a MySQL GUI client (TablePlus, DBeaver) with the Railway connection string and run `database/schema.sql` directly.

---

## Environment Variables

| Variable     | Description                                     |
|--------------|-------------------------------------------------|
| `PORT`       | Port the server listens on (default: 5000)      |
| `DB_HOST`    | MySQL host (e.g. `monorail.proxy.rlwy.net`)     |
| `DB_PORT`    | MySQL port (default: 3306)                      |
| `DB_USER`    | MySQL username                                  |
| `DB_PASSWORD`| MySQL password                                  |
| `DB_NAME`    | Database name (default: `smartseason`)          |
| `JWT_SECRET` | Secret key for signing JWTs — keep this strong  |
| `NODE_ENV`   | `development` or `production`                   |

---

## Status Computation Logic

After every field update, the API automatically computes the field's status using this logic:

1. **`completed`** — if the submitted stage is `harvested`
2. **`at_risk`** — if the update contains any of the following risk flags: `pest_infestation`, `disease_outbreak`, `drought_stress`, `waterlogging`, `nutrient_deficiency` — OR if the field hasn't been updated in more than 14 days and hasn't been harvested yet
3. **`active`** — everything else

The computed status and the new stage are written back to the parent `fields` row immediately after the update is saved.

---

## Demo Seed Credentials

Register these manually via the API endpoints below:

**Admin:**
- email: `admin@smartseason.com`
- password: `Admin1234`
- role: `admin`

**Agent:**
- email: `agent@smartseason.com`
- password: `Agent1234`
- role: `agent`

---

## Postman Testing Guide

### Base URL

```
http://localhost:5000/api
```

For Railway, replace with your Railway service URL.

---

### Auth Endpoints

#### POST /auth/register

Register a new user.

```json
{
  "name": "James Odhiambo",
  "email": "admin@smartseason.com",
  "password": "Admin1234",
  "role": "admin"
}
```

**Expected response (201):**
```json
{
  "success": true,
  "data": {
    "token": "<jwt>",
    "user": { "id": 1, "name": "James Odhiambo", "email": "admin@smartseason.com", "role": "admin" }
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

**Expected response (200):**
```json
{
  "success": true,
  "data": {
    "token": "<jwt>",
    "user": { "id": 1, "name": "James Odhiambo", "email": "admin@smartseason.com", "role": "admin" }
  }
}
```

> Copy the `token` value and set it as `Authorization: Bearer <token>` header for all protected endpoints.

---

### Fields Endpoints

> All fields endpoints require `Authorization: Bearer <token>` header.

#### POST /fields *(admin only)*

```json
{
  "name": "North Block A",
  "crop_type": "Maize",
  "planting_date": "2024-03-01",
  "assigned_agent_id": 2
}
```

**Expected response (201):**
```json
{
  "success": true,
  "data": { "id": 1, "name": "North Block A", "crop_type": "Maize", ... }
}
```

---

#### GET /fields

- **Admin:** returns all fields with agent name
- **Agent:** returns only their assigned fields

**Expected response (200):**
```json
{
  "success": true,
  "data": [ { "id": 1, "name": "North Block A", "agent_name": "Grace Wanjiru", ... } ]
}
```

---

#### GET /fields/:id

Returns a single field with its full update history.

**Expected response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "North Block A",
    "updates": [ { "id": 1, "stage": "growing", "notes": "Looking healthy", ... } ]
  }
}
```

---

#### PATCH /fields/:id/assign *(admin only)*

Reassign a field to a different agent.

```json
{
  "agent_id": 3
}
```

**Expected response (200):**
```json
{
  "success": true,
  "data": { "id": 1, "assigned_agent_id": 3, ... }
}
```

---

#### DELETE /fields/:id *(admin only)*

**Expected response (200):**
```json
{
  "success": true,
  "message": "Field deleted"
}
```

---

### Updates Endpoints

> Requires `Authorization: Bearer <agent-token>` header. Only the agent assigned to a field can submit updates for it.

#### POST /updates

```json
{
  "field_id": 1,
  "stage": "growing",
  "notes": "Good canopy cover, no signs of stress",
  "risk_flags": []
}
```

**With risk flags:**
```json
{
  "field_id": 1,
  "stage": "growing",
  "notes": "Spotted aphid clusters on lower leaves",
  "risk_flags": ["pest_infestation"]
}
```

**Expected response (201):**
```json
{
  "success": true,
  "data": { "id": 1, "field_id": 1, "stage": "growing", "risk_flags": "[\"pest_infestation\"]", ... }
}
```

> After this call, the parent field's `status` will be updated to `at_risk` and `current_stage` to `growing` automatically.

**Harvested (triggers completed status):**
```json
{
  "field_id": 1,
  "stage": "harvested",
  "notes": "Full harvest complete, yield 4.2 tonnes/ha",
  "risk_flags": []
}
```

---

#### GET /updates/field/:field_id

- Admin can access updates for any field
- Agent can only access updates for fields assigned to them

**Expected response (200):**
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

> Requires authentication. Response varies by role.

#### GET /dashboard

**Admin response (200):**
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

**Agent response (200):**
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

| Flag                   |
|------------------------|
| `pest_infestation`     |
| `disease_outbreak`     |
| `drought_stress`       |
| `waterlogging`         |
| `nutrient_deficiency`  |

### Valid Stage Values

`planted` → `growing` → `ready` → `harvested`

---

## Deployment on Railway

1. Push this repo to GitHub
2. Create a new Railway project and connect the GitHub repo
3. Add a **MySQL** database plugin
4. Set all environment variables in the Railway service settings (copy from `.env.example`)
5. Set the start command to `npm start` (Railway auto-detects `package.json`)
6. Run `database/schema.sql` against the Railway MySQL instance (see Railway MySQL Setup above)
7. Deploy — Railway will build and start the service automatically

The `/health` endpoint (`GET /health`) can be used as a Railway health check URL.
