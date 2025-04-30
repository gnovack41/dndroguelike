import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../database/schema';

export const tables = schema;

export function useDrizzle() {
    return drizzle(hubDatabase(), { schema });
}

export type User = typeof tables.user.$inferSelect;
export type Map = typeof tables.map.$inferSelect;
export type Node = typeof tables.node.$inferSelect;
export type Edge = typeof tables.edge.$inferSelect;
