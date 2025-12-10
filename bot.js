import { Bot } from "@maxhub/max-bot-api"
import dotenv from "dotenv"
import fs from "fs"

import startHandler from "./src/handlers/start.js"
import categoryHandler from "./src/handlers/categoryHandler.js"
import topicHandler from "./src/handlers/topicHandler.js"
import messageHandler from "./src/handlers/messageHandler.js"

import { setState, getState } from "./src/utils/state.js"
import { getChatId } from "./src/utils/getChatId.js"
import { cleanChat } from "./src/utils/cleanChat.js"
import { Keyboard } from "@maxhub/max-bot-api"


dotenv.config()

const bot = new Bot(process.env.BOT_TOKEN)

const logoPath = "/Users/egorgladkih/Visual Studo Projects/mchs-max-bot/assets/logo.png"

bot.on("bot_started", async(ctx) => {
    try {
        const buffer = fs.readFileSync(logoPath)

        const image = await ctx.api.uploadImage({
            source: buffer
        })

        await ctx.reply(
            "<b>Чат-бот Департамента гражданской защиты Курганской области</b>\n\n" +
            "Этот бот поможет вам\n" +
            "• правильно действовать при чрезвычайных ситуациях\n" +
            "• определить какую службу вызвать\n" +
            "• узнать возможности единого номера <b>112</b>\n", {
                format: "html",
                attachments: [image.toJson()]
            }
        )

        await startHandler(ctx)

    } catch (err) {
        console.log("Ошибка загрузки логотипа", err)

        await ctx.reply(
            "<b>Чат-бот Департамента гражданской защиты Курганской области</b>\nДобро пожаловать!", { format: "html" }
        )

        await startHandler(ctx)
    }
})

bot.command("start", async(ctx) => {
    return startHandler(ctx)
})

bot.action("send_message", async(ctx) => {
    const chatId = getChatId(ctx)
    if (!chatId) return

    await cleanChat(ctx)

    setState(chatId, "await_phone", true)
    setState(chatId, "type", "custom")

    await ctx.reply(
        "Пожалуйста, укажите ваш номер телефона в формате +7XXXXXXXXXX"
    )
})


bot.action("drone_report", async(ctx) => {
    const chatId = getChatId(ctx)
    if (!chatId) return

    await cleanChat(ctx)

    setState(chatId, "await_phone", true)
    setState(chatId, "type", "drone")

    await ctx.reply(
        "Пожалуйста, укажите ваш номер телефона в формате +7XXXXXXXXXX"
    )
})


bot.action(/cat:(.+)/, async(ctx) => {
    const categoryId = ctx.match[1]
    return categoryHandler(ctx, categoryId)
})

bot.action(/topic:(.+):(.+)/, async(ctx) => {
    const categoryId = ctx.match[1]
    const topicId = ctx.match[2]
    return topicHandler(ctx, categoryId, topicId)
})

bot.action(/back:(.+)/, async(ctx) => {
    const target = ctx.match[1]
    if (target === "main") {
        return startHandler(ctx)
    }
})

bot.on("message_created", async(ctx) => {
    const chatId = getChatId(ctx)
    const text = ctx.message && ctx.message.body && ctx.message.body.text ?
        ctx.message.body.text :
        null

    const contact = ctx.message && ctx.message.body && ctx.message.body.contact ?
        ctx.message.body.contact :
        null

    const s = getState(chatId)

    if (s.await_phone && text) {
        const phone = text.trim()

        if (!phone.match(/^\+7\d{10}$/)) {
            await ctx.reply("Пожалуйста, укажите номер в формате +7XXXXXXXXXX")
            return
        }

        setState(chatId, "phone", phone)
        setState(chatId, "await_phone", false)
        setState(chatId, "mode", "await_message")

        await cleanChat(ctx)

        await ctx.reply("Спасибо. Теперь напишите ваше сообщение.")
        return
    }

    if (!text) {
        return
    }

    if (text.indexOf("/start") === 0) {
        return startHandler(ctx)
    }

    const handled = await messageHandler(ctx)
    if (handled) {
        return
    }

    await ctx.reply(
        "Я не обрабатываю текстовые сообщения. Используйте меню ниже.", { format: "html" }
    )

    return startHandler(ctx)
})


export default bot
console.log("BOT STARTED")
bot.start()