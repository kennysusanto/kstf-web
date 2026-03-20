# KSTF Web Frontend (`reactjs`)

React + Vite client for the KSTF face recognition platform.

## Current Scope

- Login flow (`email + password`)
- Auth token stored in `localStorage` as `authToken`
- Shared API client with automatic `Authorization: Bearer <token>` header
- Protected app routes for:
	- Dataset management
	- Model training
	- Prediction

## Tech Stack

- React 19
- React Router
- MUI
- React Query
- Axios
- TensorFlow.js + MediaPipe Face Detection

## Environment

Create `.env` in this folder:

`VITE_API_URL=http://localhost:5172`

## Run (Local)

`npm install`

`npm run dev`

App runs on `http://localhost:5173` by default.

## Build

`npm run build`

`npm run preview`

`npm run build-dev` builds and copies `dist` to backend static assets.

## App Routes

- `/login`
- `/`
- `/dataset`
- `/dataset/create`
- `/dataset/create/:id`
- `/train`
- `/predict`

## Auth Notes

- Login request goes to `POST /api/auth/login`
- On success, token is saved and attached to outgoing API requests by `src/services/apiClient.js`
- Logout clears local auth state and token in browser storage
