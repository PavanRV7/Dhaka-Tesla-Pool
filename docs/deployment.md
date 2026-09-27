# Deployment

## Local development

1. Copy .env.example to .env and adjust values.
2. Run: `docker compose up --build`
3. Confirm the API is on http://localhost:4000/api
4. Confirm the frontend is on http://localhost:5173
5. Run migrations and seed data as needed.

## Migration and seed

```bash
npm run db:migrate --workspace apps/api
npm run db:seed --workspace apps/api
```

## Free-tier deployment guidance

This project is intentionally designed to be deployable to a free-tier PostgreSQL and Node-hosting setup, but no real credentials or hosted URLs are checked in. The app can be run locally with Docker without extra costs.

## Health checks

- API: GET /api/health
- Database: included in the health response as a connected state when DB connectivity succeeds

## Known limitations

- This project uses a simplified geography dataset and a local database instead of a real map API.
- It does not include real payment processing or live driver push notifications.
- WebSockets and event streaming are intentionally omitted for the MVP.
