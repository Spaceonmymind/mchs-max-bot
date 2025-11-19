import { lastBotMessage } from "./state.js";

export async function cleanReply(ctx, text, extra) {
    let chatId = null;

    if (ctx.update) {
        if (ctx.update.message) {
            if (ctx.update.message.recipient) {
                chatId = ctx.update.message.recipient.chat_id;
            }
        }

        if (chatId === null) {
            if (ctx.update.callbackQuery) {
                if (ctx.update.callbackQuery.recipient) {
                    chatId = ctx.update.callbackQuery.recipient.chat_id;
                }
            }
        }
    }

    // Удаление старого сообщения
    if (chatId !== null) {
        if (lastBotMessage.has(chatId)) {
            const oldMid = lastBotMessage.get(chatId);
            try {
                await ctx.api.deleteMessage({
                    chatId: chatId,
                    messageId: oldMid
                });
            } catch (e) {
                console.log("⚠️ Ошибка удаления:", e.message);
            }
        }
    }

    const response = await ctx.reply(text, extra);

    // Сохранение нового сообщения
    if (response) {
        if (response.mid) {
            lastBotMessage.set(chatId, response.mid);
        }
    }

    return response;
}