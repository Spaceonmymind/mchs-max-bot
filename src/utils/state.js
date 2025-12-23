const stateStore = new Map();

/**
 * Получить состояние чата
 * @param {number|string} chatId
 */
export function getState(chatId) {
    if (!chatId) return {};
    return stateStore.get(chatId) || {};
}

/**
 * Установить/обновить состояние чата
 * (merge, а не overwrite)
 * @param {number|string} chatId
 * @param {object} data
 */
export function setState(chatId, data) {
    if (!chatId || !data) return;

    const prev = stateStore.get(chatId) || {};
    stateStore.set(chatId, {
        ...prev,
        ...data,
        updatedAt: Date.now()
    });
}

/**
 * Очистить состояние чата полностью
 * @param {number|string} chatId
 */
export function clearState(chatId) {
    if (!chatId) return;
    stateStore.delete(chatId);
}

export function dumpState() {
    return Array.from(stateStore.entries());
}