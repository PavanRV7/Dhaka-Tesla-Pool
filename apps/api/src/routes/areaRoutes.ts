import { Router } from 'express';
import { db } from '../db/client.js';
import { areas } from '../db/schema.js';

export const areaRoutes = Router();

areaRoutes.get('/', async (_req, res, next) => {
  try {
    const allAreas = await db.select().from(areas).orderBy(areas.name);
    res.json({ success: true, areas: allAreas });
  } catch (error) {
    next(error);
  }
});
