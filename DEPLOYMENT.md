# Deploy checklist

The app is split into a Vite frontend, an Express API, and an Oracle database.

## Frontend

- Set `VITE_API_URL` to the public backend URL ending in `/api` before running `npm run build` from `frontend/`.
- Serve `frontend/dist` from a static host with SPA fallback to `index.html`.
- Use HTTPS for the public frontend and API.

## Backend

- Run `npm ci` and `npm start` from `backend/`.
- Configure `PORT`, `NODE_ENV=production`, `DB_USER`, `DB_PASSWORD`, `DB_CONNECT_STRING`, and a long random `JWT_SECRET` in the hosting provider's secret settings.
- Set `FRONTEND_URL` to the exact public frontend origin. Add any additional approved origins to `CORS_ORIGINS` as a comma-separated list.
- Set `FRONTEND_URL` and SMTP settings (`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`) if password reset email is required.
- Configure Oracle network access, wallet/TLS settings if required by the chosen Oracle service, and ensure the DB user can reach the hotel schema.
- Review and apply migrations `002_rbac.sql` and `003_staff_finance.sql` in order, using the schema owner and an approved maintenance window. They change schema/data and should be backed up first. `001_hotel_settings.sql` is a legacy setup script with example SQL, not a migration to execute as-is.
- Promote the intended first manager account manually after verifying its user ID, following the note in migration 002.
- Check `/api/health` after deployment; it returns `503` if the API cannot reach Oracle.

## Current deployment status

The repository contains no server/hosting target, production API hostname, or deployment credentials, so deployment itself cannot be completed from this workspace. The Oracle connection and production secrets are not validated here. Treat the app as **not yet deployable** until the production environment is configured, migrations are applied, and `/api/health` reports `ok` from the deployed host.
