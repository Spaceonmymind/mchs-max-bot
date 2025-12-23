// src/handlers/messageHandler.js

import { getState, setState, clearState } from "../utils/state.js"
import { saveEmergency } from "../utils/emergencyStore.js"

export default async function messageHandler(ctx) {
    if (!ctx || !ctx.chat || !ctx.message || !ctx.message.body) {
        return
    }

    const chatId = ctx.chat.id
    const text = ctx.message.body.text

    if (!text) {
        return
    }

    const message = text.trim()
    const state = getState(chatId)
    const step = state.step

    // --- ШАГ 1 ОЖИДАЕМ ТЕЛЕФОН ---
    if (step === "await_phone") {
        if (!message.match(/^\+7\d{10}$/)) {
            await ctx.reply("Пожалуйста, укажите номер телефона в формате +7XXXXXXXXXX")
            return
        }

        setState(chatId, {
            phone: message,
            step: "await_message"
        })

        await ctx.reply("Спасибо. Теперь опишите ситуацию")
        return
    }

    // --- ШАГ 2 ОЖИДАЕМ СООБЩЕНИЕ ---
    if (step === "await_message") {
        if (message.length < 3) {
            await ctx.reply("Сообщение слишком короткое. Опишите ситуацию подробнее")
            return
        }

        const emergency = {
            chatId: chatId,
            phone: state.phone,
            type: state.type || "custom",
            message: message,
            timestamp: Date.now(),
            status: "new"
        }

        await saveEmergency(emergency)

        clearState(chatId)

        await ctx.reply("Сообщение принято и передано оператору. Спасибо!")
        return
    }

    // --- НЕТ АКТИВНОГО СЦЕНАРИЯ ---
    await ctx.reply("Пожалуйста, выберите действие в меню")
}