const userState = new Map();

export function setState(userId, key, value) {
    if (!userId) return;

    if (!userState.has(userId)) {
        userState.set(userId, {});
    }

    const obj = userState.get(userId);
    obj[key] = value;
}

export function getState(userId) {
    if (!userId) return {};

    if (!userState.has(userId)) return {};

    return userState.get(userId);
}

export function clearState(userId) {
    if (!userId) return;
    userState.delete(userId);
}

export const lastBotMessage = new Map();