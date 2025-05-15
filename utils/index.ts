export function generateRandomString(length: number): string {
    return Math.random().toString(36).substring(2, length + 2);
}

export const PLAYER_JOINED_MESSAGE = 'player_joined';
