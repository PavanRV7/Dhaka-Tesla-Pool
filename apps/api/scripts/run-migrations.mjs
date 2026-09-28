import fs from 'node:fs/promises';
import path from 'node:path';
import 'dotenv/config';
import pg from 'pg';

const { Client } = pg;
const migrationDir = path.resolve(process.cwd(), 'drizzle');
const connectionString = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/dhaka_tesla_pool';

const files = (await fs.readdir(migrationDir))
  .filter((file) => file.endsWith('.sql'))
  .sort();

if (files.length === 0) {
  console.log('No migration files found in drizzle/');
  process.exit(0);
}

const client = new Client({ connectionString });
await client.connect();

try {
  for (const file of files) {
    const sql = await fs.readFile(path.join(migrationDir, file), 'utf8');
    console.log(`Applying ${file}`);
    await client.query(sql);
  }

  console.log('Database migration complete.');
} finally {
  await client.end();
}
