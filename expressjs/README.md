# KSTF Web Backend (`expressjs`)

Express + MySQL API for KSTF Web.

## Current Scope

- Authentication with `email + password`
- Token persistence in `user.access_token`
- Auth context middleware (`req.userId`, `req.user`)
- CRUD APIs for tenant and user
- Dataset and training endpoints used by the React client
- Auto database initialization and seed at startup

## Tech Stack

- Express 5
- mysql2
- dotenv
- body-parser
- method-override
- cors

## Environment

Create `.env` in this folder:

`MYSQL_HOST=127.0.0.1`

`MYSQL_PORT=3306`

`MYSQL_USER=root`

`MYSQL_PASSWORD=root`

`MYSQL_DB=kstf-web`

## Run (Local)

`npm install`

`npm run dev-win`

Alternative scripts:

- `npm run dev`
- `npm run dev2`

API server runs on `http://localhost:5172`.

## Database Initialization

On startup, backend creates database/tables if needed and seeds:

- Tenant: `master-tenant`
- User: `admin@mastertenant.com` / `admin`

## API Routes

### Public

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/version`

### Protected by `authContext`

- `/api/dataset/*`
- `/api/train/*`
- `/api/tenant/*`
- `/api/user/*`

`authContext` reads `Authorization: Bearer <token>`, resolves user by `access_token`, and attaches:

- `req.userId`
- `req.user`

## Notes

- Current password comparison is plain-text and intended for development; use hashed passwords for production.
- Frontend must send bearer token (handled by `reactjs/src/services/apiClient.js`).
