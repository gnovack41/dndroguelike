import { z } from 'zod';
import { generateRandomString } from '../../../utils';


export default defineEventHandler(async (event) => {
    const sessionData = await readValidatedBody(
        event,
        body => z.object({ map_id: z.string() }).parse(body),
    );

    const newSession = (
        await useDrizzle()
            .insert(tables.sessions).values({
                id: sessionData.map_id,
                access_code: generateRandomString(6),
                created_at: new Date(),
                modified_at: new Date(),
            })
            .onConflictDoUpdate({
                target: tables.sessions.id,
                set: {
                    access_code: generateRandomString(6),
                    modified_at: new Date(),
                },
            })
            .returning()
    )[0];

    return newSession.access_code;
});
