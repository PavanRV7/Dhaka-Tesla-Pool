import { sql } from 'drizzle-orm';
import app from './app.js';
import { db } from './db/client.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

const startServer = async () => {
  try {
    await db.execute(sql`SELECT 1`);
    app.listen(env.port, () => {
      logger.info(`Dhaka Tesla Pool API running on http://localhost:${env.port}`);
    });
  } catch (error) {
    logger.error('Unable to connect to PostgreSQL', error);
    process.exit(1);
  }
};

startServer();
