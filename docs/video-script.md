# 6 Minute Demo Script

0:00 - 1:00
- Explain the Dhaka traffic problem and how the app helps people share a Tesla.
- Introduce the user roles: passenger and driver.
- Summarize the core product: request, match, pool, ride, fare, status history.

1:00 - 3:00
- Walk through the architecture: React frontend, Express backend, PostgreSQL, and Drizzle.
- Explain the ride lifecycle: REQUESTED → MATCHED → DRIVER_ARRIVED → STARTED → COMPLETED.
- Highlight one engineering decision: transactional seat locking to prevent overbooking.
- Explain one trade-off: simplified geography and fixed fares instead of full map routing.

3:00 - 6:00
- Demo passenger signup and login.
- Create a Banani to Mohakhali ride request and show the estimate.
- Log in as Jashim, go online, and inspect compatible requests.
- Accept the ride and show the pool occupancy.
- Create a second compatible request and add it to the same Tesla pool.
- Show the fare values and route compatibility.
- Demonstrate driver arrival, start, and completion.
- Close by showing the status history and explaining the production-minded design decisions.
