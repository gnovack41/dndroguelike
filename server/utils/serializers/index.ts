import {H3Event} from "h3";


export async function useSerializer<T>(
    event: H3Event,
    serializer: any,
): Promise<T> {
    const result = await readValidatedBody(event, body => serializer.safeParse(body));

    if (!result) throw result.error.issues;

    return result.data as T;
}
