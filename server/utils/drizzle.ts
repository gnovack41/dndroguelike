import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../database/schema';

export const tables = schema;

export function useDrizzle() {
    return drizzle(hubDatabase(), { schema });
}

export type Session = typeof tables.sessions.$inferSelect;
