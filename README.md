# Dhaka Tesla Pool

## Tagline

Share a seat. Split the fare. Survive Dhaka traffic.

## Problem statement

Dhaka commuting can be slow, expensive, and crowded. This MVP demonstrates a simple pooled taxi flow for a Tesla-style vehicle with deterministic route matching, a fixed fare model, and safe seat allocation.

## Product overview

Dhaka Tesla Pool is a lightweight ride-pooling application for passengers and drivers. Passengers request rides, estimate fares, and view status. Drivers go online, review compatible requests, accept passengers into a pool, and advance the ride through the lifecycle.

## User roles

- Passenger: request rides, estimate fares, view status, cancel where allowed.
- Driver: verify compatible passengers, accept rides, manage pool lifecycle, mark arrival, start, complete, and review history.

## Features

- Role-based auth with JWT
- Dhaka area definitions and simplified route compatibility
- Fare estimation based on a fixed BDT model
- Pool membership and vehicle capacity enforcement
- Ride lifecycle tracking and history
- Seeded demo flow for Jashim, Nusrat, Rafiq, and Shirin
- Docker-ready local environment

## Demo story

Jashim logs in as the driver, goes online, and sees compatible requests from Nusrat and Rafiq. They share Bullet with a matching route and split the fare. Shirin can attempt the remaining seat, while the system enforces a strict capacity limit and logs ride history.

## Architecture

See [docs/architecture.md](docs/architecture.md).

## ERD

See [docs/erd.md](docs/erd.md).

## Tech stack

- React + Vite + TypeScript
- Express + TypeScript
- PostgreSQL
- Drizzle ORM
- JWT + bcryptjs + Zod
- Vitest + Supertest
- Docker + Docker Compose

## Technology choices and alternatives

### Why React + Vite?
React and Vite are fast for a small dashboard app and easy to run locally.
Alternative: Next.js would be heavier for a simple MVP.

### Why Express?
Express is minimal and well suited to this REST API workload.
Alternative: NestJS would add more structure than the project needs.

### Why PostgreSQL?
PostgreSQL provides reliable transactions and relational integrity for seat allocation and ride history.
Alternative: SQLite is fine for a toy app but not as strong for transactional concurrency.

### Why Drizzle?
Drizzle gives typed SQL and migration control suitable for the project’s schema.
Alternative: Prisma would work but adds a different developer workflow.

### Why JWT?
JWT is a straightforward way to carry identity across API requests for an MVP.
Alternative: session cookies are also valid but are less convenient for a decoupled API.

### Why Zod?
Zod validates request payloads early and clearly.
Alternative: Joi is also solid but less ergonomic for this TypeScript-first setup.

### Why Tailwind?
Tailwind allows quick, clean interface building without heavy component complexity.
Alternative: plain CSS or CSS modules also work.

### Why Vitest/Supertest?
Vitest is lightweight and integrates well with TypeScript. Supertest keeps API-level verification simple.
Alternative: Jest is popular but heavier for this project footprint.

### Why REST instead of GraphQL?
REST fits the simple CRUD and resource-oriented backend cleanly and is easier for a small team to inspect and explain.
Alternative: GraphQL adds complexity without clear benefit for an MVP.

### Why predefined geography?
The app intentionally avoids real map data to stay free, deterministic, and locally runnable.
Alternative: provider-based map APIs would add licensing, costs, and network dependencies.

### Why integer paisa?
Money is stored as integer paisa to avoid floating-point issues and keep the fare model exact.
Alternative: decimals would make auditing and rounding more error-prone.

### Why row locking for concurrency?
Row-level locking prevents two drivers or requests from booking the final seat at the same time.
Alternative: application-only checks are not enough under real race conditions.

## Project structure

- apps/api: Express API and Drizzle schema
- apps/web: React + Vite frontend
- docs: architecture, API docs, deployment, scaling, and demo script
- docker-compose.yml: local compose stack

## Prerequisites

- Node.js 20+
- npm 10+
- Docker Desktop or Docker Engine
- PostgreSQL if running locally without Docker

## Environment variables

See [.env.example](.env.example).

## Local setup

```bash
npm install
cp .env.example .env
npm run db:migrate --workspace apps/api
npm run db:seed --workspace apps/api
npm run dev
```

## Docker setup

```bash
docker compose up --build
docker compose down
```

## Database migration and seed

```bash
npm run db:generate --workspace apps/api
npm run db:migrate --workspace apps/api
npm run db:seed --workspace apps/api
```

## Demo credentials

- Jashim: jashim@example.com / DemoPass123!
- Nusrat: nusrat@example.com / DemoPass123!
- Rafiq: rafiq@example.com / DemoPass123!
- Shirin: shirin@example.com / DemoPass123!

## API overview

See [docs/api.md](docs/api.md).

## Ride lifecycle

REQUESTED → MATCHED → DRIVER_ARRIVED → STARTED → COMPLETED
Cancellation is allowed only in valid states.

## Matching algorithm

Matching is deterministic and simplified. Requests are compatible when they share a pickup zone or a route corridor, use compatible destination logic, and do not exceed remaining Tesla capacity.

## Fare calculation

- baseFare = 50 BDT
- distanceRate = 20 BDT per km
- soloFare = baseFare + (distance * rate)
- pooledFare = soloFare - (soloFare * 0.2)
- Stored in integer paisa

## Money storage strategy

The system stores money as integer paisa to avoid floating-point drift.

## Concurrency strategy

The current implementation follows the safety pattern of locking the vehicle row and re-checking remaining capacity before creating a pool membership. This protects the final-seat race condition.

## Security

- bcryptjs password hashing
- JWT authentication
- role enforcement
- Zod validation for request payloads
- CORS + Helmet
- no secrets committed in source control

## Testing

```bash
npm --workspace apps/api run test -- --run
npm --workspace apps/api run typecheck
npm --workspace apps/web run typecheck
```

## Deployment

See [docs/deployment.md](docs/deployment.md).

## Known limitations

- This is a simplified MVP and does not include live maps or payment gateways.
- Driver and passenger dashboards are lightweight and designed for a local demo, not a production-grade operations console.
- Pool matching uses predefined routes rather than real routing intelligence.

## Future improvements

- richer route data and map integration
- real payment provider
- websocket real-time updates
- stronger analytics and reporting
- more robust front-end flows for editing and cancellations

## AI Usage

This project was created in a VS Code workspace and used AI assistance for scaffolding, service logic, test generation, and documentation. The specific accepted/rejected examples should be filled in before final public submission if the project is being presented externally.

| AI Tool | Purpose |
|---------|---------|
| VS Code Codex | scaffolding, code generation, debugging, documentation assistance |

### Accepted suggestion

TODO: fill in one accepted suggestion after a final review pass.

### Rejected/changed suggestion

TODO: fill in one rejected or modified suggestion after the final project review.

## Demo video link placeholder

Add your video link here once recorded.

## Screenshots / GIF section

Add screenshots of the passenger and driver flows here once the demo is recorded.

## Git workflow

The repository is managed in a small feature-branch flow with a master branch, a pre-release branch, and a release/v1.0.0 branch.
