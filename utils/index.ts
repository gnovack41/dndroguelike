export function generateRandomString(length: number): string {
    return Math.random().toString(36).substring(2, length + 2);
}

export const PLAYER_JOINED_MESSAGE = 'player_joined';
export const PLAYER_LEFT_MESSAGE = 'player_left';

export const SESSION_ENDED = 'session_ended';
