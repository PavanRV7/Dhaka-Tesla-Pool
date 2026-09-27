# Assumptions

- Geography is intentionally predefined rather than mapped to a vendor API.
- Distance is deterministic and stored in a simple table using representative Dhaka distances.
- The fare model uses a base fare of 50 BDT and 20 BDT per kilometer.
- Pool discounts are fixed at 20% when a rider is in a pool with two or more people.
- Cancellation is allowed only while REQUESTED or MATCHED.
- Maximum passenger seats per Tesla are capped at 3 for this MVP.
- Route compatibility is deterministic and based on shared pickup and compatible destination corridors.
- The driver owns one Tesla with a fixed capacity.
- The app uses polling instead of real-time sockets for the MVP.
- TeslaPay is a simulated internal wallet; no actual payment gateway is integrated.
