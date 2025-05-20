import { eq } from 'drizzle-orm';


export async function getSessionCreatedById(sessionId: string): Promise<string | null> {
    const result = await useDrizzle()
        .select({ created_by_id: tables.sessions.created_by_id }).from(tables.sessions)
        .where(eq(tables.sessions.id, sessionId)).get();

    if (!result) {
        return null;
    }

    return result.created_by_id;
}
