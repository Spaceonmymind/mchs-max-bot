import { lastBotMessage } from "./state.js"
import { getChatId } from "./getChatId.js"

export async function cleanChat(ctx) {
    const chatId = getChatId(ctx)
    if (!chatId) {
        return
    }

    if (lastBotMessage.has(chatId)) {
        const botMid = lastBotMessage.get(chatId)

        try {
            await ctx.api.deleteMessage({
                chatId: chatId,
                messageId: botMid
            })
        } catch (e) {
            console.log("Ошибка удаления сообщения бота", e.message)
        }
    }
}