import { z } from 'zod';


export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(
        event,
        body => z.object({ access_code: z.string() }).parse(body),
    );

    const session = await useDrizzle().query.sessions.findFirst({
        where: (s, { eq }) => eq(s.access_code, body.access_code),
    });

    if (!session) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid access code',
        });
    }

    return session.id;
});
