# Deployment

## Local development

1. Copy `.env.example` to `.env` and adjust the values if needed.
2. Start the application:

   ```bash
   docker compose up --build
   ```

3. Confirm the API is available at `http://localhost:4000/api`.
4. Confirm the frontend is available at `http://localhost:5173`.
5. Run migrations and seed data if required:

   ```bash
   npm run db:migrate --workspace apps/api
   npm run db:seed --workspace apps/api
   ```

## Migration and seed

```bash
npm run db:generate --workspace apps/api
npm run db:migrate --workspace apps/api
npm run db:seed --workspace apps/api
```

Use `db:generate` when the Drizzle schema has changed and a new migration needs to be generated.

## Free-tier deployment guidance

The application can be deployed using a free-tier PostgreSQL provider and a free-tier Node.js hosting platform. No production credentials or hosted URLs are included in this repository.

The application can also be run locally with Docker without requiring paid services.

## Health checks

- API: `GET /api/health`
- Database: included in the health response as a connected state when DB connectivity succeeds

## Known limitations

- The project uses a simplified geography dataset and a local database instead of a real map API.
- It does not include real payment processing or live driver push notifications.
- WebSockets and event streaming are intentionally omitted for the MVP.
