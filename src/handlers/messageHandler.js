// src/handlers/messageHandler.js

import { getState, setState, clearState } from "../utils/state.js"
import { saveEmergency } from "../utils/emergencyStore.js"

export default async function messageHandler(ctx) {
    // 🔴 ЖЁСТКОЕ ЛОГИРОВАНИЕ
    console.log("MESSAGE_HANDLER_ENTER")
    console.log("CTX.UPDATE", JSON.stringify(ctx.update, null, 2))
    console.log("CTX.MESSAGE", JSON.stringify(ctx.message, null, 2))

    if (!ctx || !ctx.message || !ctx.message.body) {
        console.log("EXIT: no message/body")
        return
    }

    // ✅ ПРАВИЛЬНОЕ ИЗВЛЕЧЕНИЕ chatId ДЛЯ MAX
    const chatId =
        ctx.update && ctx.update.chat_id ?
        ctx.update.chat_id :
        ctx.message.recipient && ctx.message.recipient.chat_id ?
        ctx.message.recipient.chat_id :
        null

    if (!chatId) {
        console.log("EXIT: chatId not found")
        return
    }

    console.log("chatId =", chatId)

    // ✅ ИЗВЛЕЧЕНИЕ ТЕКСТА
    let text = null

    if (ctx.message.body.text) {
        text = ctx.message.body.text
    } else if (ctx.message.body.phone) {
        text = ctx.message.body.phone
    } else if (ctx.message.body.payload) {
        text = ctx.message.body.payload
    }

    if (!text) {
        console.log("EXIT: no text in message body")
        return
    }

    const message = text.trim()
    console.log("MESSAGE =", message)

    const state = getState(chatId)
    console.log("STATE =", state)

    const step = state.step

    // --- ШАГ 1: ОЖИДАЕМ ТЕЛЕФОН ---
    if (step === "await_phone") {
        console.log("STEP await_phone")

        if (!message.match(/^\+7\d{10}$/)) {
            await ctx.reply("Пожалуйста, укажите номер телефона в формате +7XXXXXXXXXX")
            return
        }

        setState(chatId, {
            phone: message,
            step: "await_message"
        })

        console.log("PHONE SAVED, STATE UPDATED")

        await ctx.reply("Спасибо. Теперь опишите ситуацию")
        return
    }

    // --- ШАГ 2: ОЖИДАЕМ СООБЩЕНИЕ ---
    if (step === "await_message") {
        console.log("STEP await_message")

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

        console.log("EMERGENCY SAVED")

        await ctx.reply("Сообщение принято и передано оператору. Спасибо!")
        return
    }

    // --- НЕТ АКТИВНОГО СЦЕНАРИЯ ---
    console.log("NO ACTIVE SCENARIO")
    await ctx.reply("Пожалуйста, выберите действие в меню")
}