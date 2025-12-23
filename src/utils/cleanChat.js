// src/utils/cleanChat.js

export async function cleanChat(ctx) {
    if (!ctx || !ctx.chat) {
        return
    }

    // Временно ничего не чистим
    // Массовое удаление сообщений вызывает лаги в MAX API
    return
}