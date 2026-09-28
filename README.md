# Dhaka Tesla Pool

> Share a seat. Split the fare. Survive Dhaka traffic.

A full-stack ride-pooling MVP for Dhaka. Passengers can request rides and track their status, while drivers can accept compatible requests and manage a fixed-capacity Tesla pool.

---

## Problem Statement

Dhaka commuting can be slow, expensive, and crowded. This MVP demonstrates a simple ride-pooling system where passengers can share a Tesla-style vehicle, split fares, and track their ride lifecycle.

The system focuses on deterministic matching, fare calculation, pool capacity, ride states, authentication, and data consistency.

---

## Features

### Passenger

- Register and login
- Select pickup and destination
- Estimate fare
- Request a ride
- Track ride status
- Cancel rides when allowed
- View ride history

### Driver

- Login and go online/offline
- View compatible requests
- Accept passengers
- View current Tesla pool
- View occupied seats
- Mark driver arrival
- Start and complete trips
- View ride history

### Core Engineering

- JWT authentication
- bcrypt password hashing
- Role-based authorization
- Zod request validation
- Ride state validation
- Fixed Tesla capacity enforcement
- Transaction-based seat allocation
- Concurrent acceptance protection
- Centralized error handling
- PostgreSQL persistence
- Dockerized local environment

---

## Demo Story

The seeded demo uses:

| Role | Name | Details |
| --- | --- | --- |
| Driver | Jashim | Owns Bullet |
| Tesla | Bullet | 3 seats |
| Passenger | Nusrat | Banani → Mohakhali |
| Passenger | Rafiq | Banani → Gulshan 1 |
| Passenger | Shirin | Additional capacity test |

Typical flow:

```text
Passenger requests ride
        ↓
Driver sees compatible request
        ↓
Driver accepts passenger
        ↓
Passenger joins Tesla pool
        ↓
Driver arrives
        ↓
Trip starts
        ↓
Trip completes
```

---

## Architecture

```text
Browser
   │
   ▼
React + Vite
   │
   │ REST / JSON
   ▼
Express + TypeScript API
   │
   │ Drizzle ORM
   ▼
PostgreSQL
```

Detailed architecture:

- [Architecture](docs/architecture.md)
- [ERD](docs/erd.md)
- [API Documentation](docs/api.md)
- [Deployment](docs/deployment.md)

---

## Tech Stack

| Area | Technology | Alternative / Reason |
| --- | --- | --- |
| Frontend | React + Vite + TypeScript | Next.js was unnecessary for this SPA-style MVP |
| Backend | Express + TypeScript | Lightweight REST API; NestJS would add more structure |
| Database | PostgreSQL | Strong relational integrity and transactions |
| ORM | Drizzle | Typed SQL with explicit database control |
| Authentication | JWT + bcryptjs | Simple for a separated frontend/API |
| Validation | Zod | Type-safe request validation |
| Styling | Tailwind CSS | Fast, consistent UI development |
| Testing | Vitest + Supertest | Lightweight unit/API testing |
| Deployment | Docker Compose | Reproducible local environment |

The project intentionally avoids unnecessary microservices, queues, Redis, or Kubernetes for this MVP.

---

## Project Structure

```text
Dhaka_Tesla_Pool/
├── apps/
│   ├── api/              # Express API, services, database
│   └── web/              # React frontend
├── docs/
│   ├── architecture.md
│   ├── api.md
│   ├── deployment.md
│   └── erd.md
├── docker-compose.yml
├── .env.example
├── package.json
└── README.md
```

---

## Prerequisites

- Node.js 20+
- npm 10+
- Docker Desktop / Docker
- PostgreSQL if running without Docker

---

## Environment Variables

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dhaka_tesla_pool
JWT_SECRET=your-development-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

---

## Local Setup

Install dependencies:

```bash
npm install
```

Create environment variables:

```bash
cp .env.example .env
```

Run migrations:

```bash
npm run db:migrate --workspace apps/api
```

Seed demo data:

```bash
npm run db:seed --workspace apps/api
```

Start the application:

```bash
npm run dev
```

Application URLs:

```text
Frontend: http://localhost:5173
API:      http://localhost:4000/api
```

---

## Docker

Build and start the application:

```bash
docker compose up --build
```

Stop the application:

```bash
docker compose down
```

The Compose setup includes the frontend, backend, and PostgreSQL database.

---

## Database Commands

Generate migrations after schema changes:

```bash
npm run db:generate --workspace apps/api
```

Apply migrations:

```bash
npm run db:migrate --workspace apps/api
```

Seed demo data:

```bash
npm run db:seed --workspace apps/api
```

---

## Demo Credentials

### Driver Credentials

```text
Name: Jashim
Email: jashim@example.com
Password: DemoPass123!
Role: DRIVER
Vehicle: Bullet
Capacity: 3 seats
```

### Passengers Credentials

```text
Nusrat: nusrat@example.com
Rafiq:  rafiq@example.com
Shirin: shirin@example.com

Password: DemoPass123!
```

---

## Ride Lifecycle

```text
REQUESTED
    ↓
MATCHED
    ↓
DRIVER_ARRIVED
    ↓
STARTED
    ↓
COMPLETED
```

Cancellation is allowed only from valid states.

Invalid state transitions are rejected by the backend.

---

## Matching & Fare

The MVP uses predefined Dhaka areas instead of a live map API.

Matching is deterministic and based on simplified pickup/destination compatibility and available pool capacity.

Fare calculation follows:

```text
passengerFare =
    baseFare
    + distanceCharge
    - poolDiscount
```

Money is stored as integer paisa to avoid floating-point precision problems.

---

## Pool Capacity & Concurrency

Bullet has a fixed capacity of 3 seats.

Seat allocation is protected at the database level:

1. Lock the relevant vehicle row inside a transaction.
2. Re-check current pool capacity.
3. Reject the request if insufficient seats remain.
4. Add the passenger only when capacity is available.
5. Update the ride and pool membership atomically.

When the pool is full, the API returns:

```text
409 POOL_CAPACITY_EXCEEDED
```

The frontend displays:

```text
No seats are available in this Tesla pool.
```

The pending request remains visible.

This protects against two drivers/requests attempting to claim the final seat at nearly the same time.

At larger scale, this could be extended with stronger idempotency, distributed coordination where necessary, queues/events, caching, and database scaling.

---

## API Overview

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

### Passengers

```text
GET  /api/areas
GET  /api/rides
POST /api/rides/estimate
POST /api/rides
GET  /api/rides/:rideId
POST /api/rides/:rideId/cancel
```

### Drivers

```text
PATCH /api/driver/status
GET   /api/driver/requests
GET   /api/driver/pool/current
POST  /api/driver/rides/:rideId/accept
POST  /api/driver/pools/:poolId/arrive
POST  /api/driver/pools/:poolId/start
POST  /api/driver/pools/:poolId/complete
GET   /api/driver/history
```

Health check:

```text
GET /api/health
```

See [docs/api.md](docs/api.md) for details.

---

## Testing

Run API tests:

```bash
npm --workspace apps/api run test -- --run
```

Run type checks:

```bash
npm --workspace apps/api run typecheck
npm --workspace apps/web run typecheck
```

Important behaviors tested include:

- Tesla capacity cannot be exceeded
- Concurrent seat allocation is protected
- Invalid ride state transitions are rejected
- Pooled fares are calculated correctly
- Users cannot modify another user's ride
- Cancellation rules are enforced

---

## Screenshots / GIFs

![Dhaka Tesla Pool](docs/screenshots/dhaka_tesla_pool.png)
<br><br>
![Driver Arrived](docs/screenshots/driver_arrived.png)
<br><br>
![Driver Dashboard](docs/screenshots/driver_dashboard.png)
<br><br>
![Estimated Fare](docs/screenshots/estimate_fare.png)
<br><br>
![Login Page](docs/screenshots/login_page.png)
<br><br>
![Passenger Dashboard](docs/screenshots/passenger_dashboard.png)
<br><br>
![Seats Occupied](docs/screenshots/pool_open.png)
<br><br>
![Request Page](docs/screenshots/request_page.png)
<br><br>
![Requested Rides](docs/screenshots/request_ride.png)
<br><br>
![Ride Started](docs/screenshots/ride_started.png)
<br><br>
![Ride Details](docs/screenshots/ride_details.png)
<br><br>
![Seats Unavailable](docs/screenshots/seats_not_available.png)

---

## Key Decisions & Trade-offs

### Predefined Geography

Used predefined Dhaka areas instead of a live map API to keep matching deterministic, free, and easy to test.

### PostgreSQL

Used PostgreSQL because pool membership and seat capacity require reliable relational transactions and constraints.

### REST API

Used REST because the MVP has straightforward resource-based operations and does not require GraphQL complexity.

### JWT Authentication

Used JWT for simple authentication between the React frontend and Express API.

### Integer Paisa

Stored money as integer paisa to avoid floating-point rounding problems.

### Database Locking

Used row-level locking and capacity re-checking to protect the final-seat race condition.

---

## Known Limitations

- Uses simplified predefined geography.
- No live GPS tracking.
- No real payment gateway.
- No push notifications.
- No WebSocket-based real-time updates.
- Matching is simplified for the MVP.
- Designed for local/demo deployment rather than production-scale traffic.

---

## Future Improvements

- Live maps and route matching
- GPS tracking
- WebSocket real-time updates
- Push notifications
- Real payment integration
- Ratings and reviews
- Advanced geospatial search
- Caching and read replicas
- Queue/event infrastructure
- Rate limiting and idempotency
- Improved observability and horizontal scaling

---

## Local_Setup

### Prerequisite

- Node.js 20+
- npm 10+
- Docker Desktop

### Run with Docker

```bash
docker compose up --build
```

Then open:

Frontend: <http://localhost:5173>
API: <http://localhost:4000/api>

To stop the application:

```bash
docker compose down
```

---

## AI Usage

AI assistance was used during development for:

- Code scaffolding
- Debugging
- Implementation guidance
- Test planning
- Documentation
- Troubleshooting

Tools used:

- ChatGPT
- VS Code Codex

### Accepted suggestion

AI assistance suggested protecting the final Tesla seat using database row locking and re-checking capacity inside a transaction. This approach was implemented because application-level checks alone can fail when two requests attempt to claim the last seat concurrently.

### Rejected / Changed suggestion

The initial frontend acceptance flow refreshed the request list immediately after an acceptance attempt. This caused a failed full-capacity request to disappear from the UI. The flow was changed so failed acceptance displays the backend error and keeps the pending request visible.

All AI-assisted code was reviewed, tested, and modified as required.

---

## Demo Video

[Watch the Dhaka Tesla Pool Demo](https://drive.google.com/drive/folders/1tc405s6IaW-hkk1NEp3qTak745DEKqiB?usp=sharing)

---

## Git Workflow

The repository uses:

```text
master
pre-release
release/v1.0.0
feature/*
```

Example commit format:

```text
feat(pool): enforce Bullet seat capacity
fix(pool): prevent overbooking available seats
test(pool): add concurrent capacity test
docs(readme): update setup instructions
build(docker): add compose setup
```

---

## License

This project was developed as an internship assignment / MVP demonstration.
