import { getState, clearState } from "../utils/state.js"
import { saveEmergency } from "../utils/emergencyStore.js"
import { getChatId } from "../utils/getChatId.js"
import { cleanChat } from "../utils/cleanChat.js"

export default async function messageHandler(ctx) {
    const chatId = getChatId(ctx)
    if (!chatId) return false

    const s = getState(chatId)
    if (!s || s.mode !== "await_message") {
        return false
    }

    const userMessage =
        ctx && ctx.message && ctx.message.body && ctx.message.body.text ?
        ctx.message.body.text :
        "";

    const phone = s.phone || "не указан";

    const record = {
        userId: chatId,
        chatId: chatId,
        phone: phone,
        type: s.type,
        message: userMessage,
        timestamp: Date.now(),
        status: "new"
    };


    saveEmergency(record)

    await cleanChat(ctx)

    await ctx.reply(
        "Спасибо. Ваше сообщение принято. При необходимости с вами свяжутся."
    )

    clearState(chatId)
    return true
}