import type { Reactive, UnwrapRef } from 'vue';

export interface AsyncState<T, E = any> {
    result: T | null | undefined;
    error: E | null;
    isPending: boolean;
    isFulfilled: boolean;
    isRejected: boolean;
    promise: Promise<T>;
    retry: () => Promise<void> | undefined;
}

/**
 * Populated if there was an error handler but an error was unhandled and sent to Sentry
 */
export const ASYNC_STATE_UNHANDLED_ERROR = Symbol('UNHANDLED');

/**
 * Create reactive state for a promise, optionally with a special error handler
 * @returns Refs relating to the state of the promise
 */
export function useAsyncState<T, E = any>(
    promiseFn: () => Promise<T>,
    errorHandler?: (error: any) => E | undefined,
): Reactive<AsyncState<T, E | typeof ASYNC_STATE_UNHANDLED_ERROR>> {
    const promise = Promise.resolve(promiseFn()); // Make sure we're dealing with a promise

    function handleError(error: E) {
        if (!errorHandler) {
            return error;
        }

        const errorHandlerReturn = errorHandler(error);

        if (errorHandlerReturn === undefined) {
            return ASYNC_STATE_UNHANDLED_ERROR;
        }

        return errorHandlerReturn;
    }

    const startingState = {
        result: null,
        error: null,
        isPending: true,
        isFulfilled: false,
        isRejected: false,
        promise,
    };

    const state = reactive<AsyncState<T>>({ ...startingState, retry: () => undefined });

    function executePromise(p: Promise<T>) {
        return p.then(
            (value) => {
                state.result = value as UnwrapRef<T>;
                state.isPending = false;
                state.isFulfilled = true;
            },
            (error) => {
                state.error = handleError(error);
                state.isPending = false;
                state.isRejected = true;
            },
        );
    }

    state.retry = () => {
        Object.assign(state, startingState);

        state.promise = promiseFn();

        return executePromise(state.promise);
    };

    executePromise(promise);

    return state;
}
