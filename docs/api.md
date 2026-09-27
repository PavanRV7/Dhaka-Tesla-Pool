# API Overview

## Authentication

### POST /api/auth/register
- Authentication: none
- Role: public
- Body: name, email, password, role
- Response: token and user info

### POST /api/auth/login
- Authentication: none
- Role: public
- Body: email, password
- Response: token and user info

### GET /api/auth/me
- Authentication: required
- Role: any authenticated user
- Response: current user profile

## Areas

### GET /api/areas
- Authentication: none
- Response: list of Dhaka zone definitions

## Ride requests

### POST /api/rides/estimate
- Authentication: required (any user in practice)
- Body: pickupAreaId, destinationAreaId, seatsRequested
- Response: distance, solo fare, pooled fare

### POST /api/rides
- Authentication: required
- Role: PASSENGER
- Body: pickupAreaId, destinationAreaId, seatsRequested, paymentMethod
- Response: created ride request

### GET /api/rides
- Authentication: required
- Role: PASSENGER
- Response: list of this passenger's rides

### GET /api/rides/:id
- Authentication: required
- Role: PASSENGER
- Response: ride details if owned by the caller

### POST /api/rides/:id/cancel
- Authentication: required
- Role: PASSENGER
- Response: cancellation status

## Driver endpoints

### PATCH /api/driver/status
- Authentication: required
- Role: DRIVER
- Body: online boolean

### GET /api/driver/requests
- Authentication: required
- Role: DRIVER
- Response: compatible pending ride requests

### GET /api/driver/pool/current
- Authentication: required
- Role: DRIVER
- Response: active current pool

### POST /api/driver/rides/:rideId/accept
- Authentication: required
- Role: DRIVER
- Response: pool membership created

### POST /api/driver/pools/:poolId/arrive
- Authentication: required
- Role: DRIVER
- Response: pool state updated to DRIVER_ARRIVED

### POST /api/driver/pools/:poolId/start
- Authentication: required
- Role: DRIVER
- Response: pool moves to STARTED

### POST /api/driver/pools/:poolId/complete
- Authentication: required
- Role: DRIVER
- Response: pool moves to COMPLETED

### GET /api/driver/history
- Authentication: required
- Role: DRIVER
- Response: driver ride and pool history

### GET /api/health
- Authentication: none
- Response: API health and database state
