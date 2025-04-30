import { getMapDataFromId } from '../../utils/serializers/map-serializers';
import { RuntimeException } from '@poppinss/exception';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');

    try {
        return await getMapDataFromId(Number(id));
    } catch (error) {
        if (error instanceof RuntimeException) {
            throw createError({
                statusCode: 400,
                statusMessage: `Table with id ${ id } does not exist`,
            });
        }

        throw error;
    }
});
