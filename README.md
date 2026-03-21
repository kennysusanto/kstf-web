# KSTF Web

KSTF Web is a full-stack face recognition web app with:

- React + Vite frontend (`reactjs`)
- Express + MySQL backend (`expressjs`)
- Dataset management, model training, and prediction flows
- Tenant/user management and token-based authentication

## Current Project Structure

- `reactjs`: UI app (React Router, MUI, TensorFlow.js)
- `expressjs`: REST API + MySQL persistence
- `compose.yaml`: local multi-container development stack (Traefik, backend, client, MySQL, phpMyAdmin)

## Features (Current)

- Login with `email + password` via `/api/auth/login`
- Auth token persisted in browser `localStorage` as `authToken`
- React API client automatically sends `Authorization: Bearer <token>`
- Auth context middleware applied to:
	- `/api/dataset`
	- `/api/train`
	- `/api/tenant`
	- `/api/user`
- Auto DB initialization and seed on backend startup:
	- Default tenant: `master-tenant`
	- Default user: `admin@mastertenant.com` / `admin`

## Run with Docker Compose

From repository root:

`docker compose up --build -d`

Useful URLs:

- App (via Traefik): `http://localhost:81`
- phpMyAdmin: `http://localhost:82`

## Run Locally (Without Docker)

### 1) Backend (`expressjs`)

Create `expressjs/.env` with:

`MYSQL_HOST=127.0.0.1`

`MYSQL_PORT=3306`

`MYSQL_USER=root`

`MYSQL_PASSWORD=root`

`MYSQL_DB=kstf-web`

Install and run:

`cd expressjs`

`npm install`

`npm run dev-win`

Backend runs on `http://localhost:5172`.

### 2) Frontend (`reactjs`)

Set API base URL in `reactjs/.env`:

`VITE_API_URL=http://localhost:5172`

Install and run:

`cd reactjs`

`npm install`

`npm run dev`

Frontend runs on `http://localhost:5173`.

## API Overview

- Public:
	- `POST /api/auth/login`
	- `POST /api/auth/logout`
	- `GET /api/version`
- Protected (token expected):
	- `/api/dataset/*`
	- `/api/train/*`
	- `/api/tenant/*`
	- `/api/user/*`

## Frontend Routes

- `/login`
- `/`
- `/dataset`
- `/dataset/create`
- `/dataset/create/:id`
- `/train`
- `/predict`

## Scripts

### Backend (`expressjs`)

- `npm run dev` - run with nodemon
- `npm run dev-win` - run with nodemon + `.env`
- `npm run dev2` - run with node
- `npm test` - run tests

### Frontend (`reactjs`)

- `npm run dev` - start Vite dev server
- `npm run build` - production build
- `npm run preview` - preview build
- `npm run build-dev` - build and copy dist to backend static folder


## Todo

- [x] DB storage login and dataset
- [x] Tenant level separation for login and dataset
- [x] Optimization API requests on Dataset, Train, Predict pages
- [ ] Training data augmentation feature (rotation and blur variants)
- [ ] Update UI/UX
- [ ] Caching dataset in Train page