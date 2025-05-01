export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');

    return useDrizzle().query.user.findFirst({
        where: (u, { eq }) => eq(u.id, Number(id)),
        with: {
            maps: {
                columns: {
                    id: true,
                    name: true,
                }
            }
        }
    });
});
