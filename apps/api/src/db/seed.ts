import bcrypt from 'bcryptjs';
import { eq, sql } from 'drizzle-orm';
import { db } from './client.js';
import { areas, rideRequests, users, vehicles } from './schema.js';

const areaSeed = [
  { name: 'Banani', latitude: '23.7939', longitude: '90.4043' },
  { name: 'Gulshan', latitude: '23.7925', longitude: '90.4125' },
  { name: 'Gulshan 1', latitude: '23.7920', longitude: '90.4186' },
  { name: 'Mohakhali', latitude: '23.7749', longitude: '90.4068' },
  { name: 'Dhanmondi', latitude: '23.7465', longitude: '90.3760' },
  { name: 'Mirpur', latitude: '23.8223', longitude: '90.3658' },
  { name: 'Uttara', latitude: '23.8769', longitude: '90.4018' },
  { name: 'Farmgate', latitude: '23.7580', longitude: '90.3930' },
  { name: 'Bashundhara', latitude: '23.8212', longitude: '90.4248' }
];

const demoUsers = [
  { name: 'Jashim', email: 'jashim@example.com', password: 'DemoPass123!', role: 'DRIVER' },
  { name: 'Nusrat', email: 'nusrat@example.com', password: 'DemoPass123!', role: 'PASSENGER' },
  { name: 'Rafiq', email: 'rafiq@example.com', password: 'DemoPass123!', role: 'PASSENGER' },
  { name: 'Shirin', email: 'shirin@example.com', password: 'DemoPass123!', role: 'PASSENGER' },
  { name: 'Arif', email: 'arif@example.com', password: 'DemoPass123!', role: 'PASSENGER' }
] as const;

const main = async () => {
  await db.insert(areas).values(areaSeed).onConflictDoNothing();

  for (const user of demoUsers) {
    const existing = await db.query.users.findFirst({ where: eq(users.email, user.email) });
    if (!existing) {
      const passwordHash = await bcrypt.hash(user.password, 10);
      await db.insert(users).values({
        name: user.name,
        email: user.email,
        passwordHash,
        role: user.role
      });
    }
  }

  const jashim = await db.query.users.findFirst({ where: eq(users.email, 'jashim@example.com') });
  if (jashim) {
    const existingVehicle = await db.query.vehicles.findFirst({ where: eq(vehicles.driverId, jashim.id) });
    if (!existingVehicle) {
      await db.insert(vehicles).values({
        driverId: jashim.id,
        name: 'Bullet',
        vehicleType: 'Tesla',
        capacity: 3
      });
    }
  }

  const nusrat = await db.query.users.findFirst({ where: eq(users.email, 'nusrat@example.com') });
  const rafiq = await db.query.users.findFirst({ where: eq(users.email, 'rafiq@example.com') });
  const banani = await db.query.areas.findFirst({ where: eq(areas.name, 'Banani') });
  const mohakhali = await db.query.areas.findFirst({ where: eq(areas.name, 'Mohakhali') });
  const gulshan1 = await db.query.areas.findFirst({ where: eq(areas.name, 'Gulshan 1') });

  if (nusrat && banani && mohakhali) {
    const existingRide = await db.query.rideRequests.findFirst({ where: eq(rideRequests.passengerId, nusrat.id) });
    if (!existingRide) {
      await db.insert(rideRequests).values({
        passengerId: nusrat.id,
        pickupAreaId: banani.id,
        destinationAreaId: mohakhali.id,
        seatsRequested: 1,
        status: 'REQUESTED',
        estimatedFarePaisa: 8800,
        finalFarePaisa: 0,
        paymentMethod: 'CASH'
      });
    }
  }

  if (rafiq && banani && gulshan1) {
    const existingRide = await db.query.rideRequests.findFirst({ where: eq(rideRequests.passengerId, rafiq.id) });
    if (!existingRide) {
      await db.insert(rideRequests).values({
        passengerId: rafiq.id,
        pickupAreaId: banani.id,
        destinationAreaId: gulshan1.id,
        seatsRequested: 1,
        status: 'REQUESTED',
        estimatedFarePaisa: 10400,
        finalFarePaisa: 0,
        paymentMethod: 'TESLAPAY_WALLET'
      });
    }
  }

  console.log('Seed data loaded');
};

void main();
