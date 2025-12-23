import { Bot } from "@maxhub/max-bot-api"
import dotenv from "dotenv"
import fs from "fs"

import startHandler from "./src/handlers/start.js"
import categoryHandler from "./src/handlers/categoryHandler.js"
import topicHandler from "./src/handlers/topicHandler.js"
import messageHandler from "./src/handlers/messageHandler.js"

import { setState, clearState } from "./src/utils/state.js"
import { getChatId } from "./src/utils/getChatId.js"
import { cleanChat } from "./src/utils/cleanChat.js"
import { Keyboard } from "@maxhub/max-bot-api"

dotenv.config()

const bot = new Bot(process.env.BOT_TOKEN)

const logoPath = "/Users/egorgladkih/Visual Studo Projects/mchs-max-bot/assets/logo.png"

/**
 * BOT START
 */
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

/**
 * /start
 */
bot.command("start", async(ctx) => {
    const chatId = getChatId(ctx)
    if (chatId) {
        clearState(chatId)
    }
    return startHandler(ctx)
})

/**
 * КНОПКА: ПРОИЗВОЛЬНОЕ СООБЩЕНИЕ
 */
bot.action("send_message", async(ctx) => {
    const chatId = getChatId(ctx)
    if (!chatId) return

    await cleanChat(ctx)

    setState(chatId, {
        step: "await_phone",
        type: "custom"
    })

    await ctx.reply("Пожалуйста, укажите ваш номер телефона в формате +7XXXXXXXXXX")
})

/**
 * КНОПКА: СООБЩЕНИЕ О ДРОНЕ
 */
bot.action("drone_report", async(ctx) => {
    const chatId = getChatId(ctx)
    if (!chatId) return

    await cleanChat(ctx)

    setState(chatId, {
        step: "await_phone",
        type: "drone"
    })

    await ctx.reply("Пожалуйста, укажите ваш номер телефона в формате +7XXXXXXXXXX")
})

/**
 * КАТЕГОРИИ
 */
bot.action(/cat:(.+)/, async(ctx) => {
    const categoryId = ctx.match[1]
    return categoryHandler(ctx, categoryId)
})

/**
 * ТОПИКИ
 */
bot.action(/topic:(.+):(.+)/, async(ctx) => {
    const categoryId = ctx.match[1]
    const topicId = ctx.match[2]
    return topicHandler(ctx, categoryId, topicId)
})

/**
 * НАЗАД В ГЛАВНОЕ МЕНЮ
 */
bot.action(/back:(.+)/, async(ctx) => {
    const target = ctx.match[1]
    if (target === "main") {
        const chatId = getChatId(ctx)
        if (chatId) {
            clearState(chatId)
        }
        return startHandler(ctx)
    }
})

/**
 * ВСЕ ТЕКСТОВЫЕ СООБЩЕНИЯ
 */
bot.on("message_created", async(ctx) => {
    const text = ctx.message && ctx.message.body && ctx.message.body.text ?
        ctx.message.body.text :
        null

    if (!text) {
        return
    }

    // /start текстом
    if (text.indexOf("/start") === 0) {
        const chatId = getChatId(ctx)
        if (chatId) {
            clearState(chatId)
        }
        return startHandler(ctx)
    }

    // Вся логика сценариев здесь
    await messageHandler(ctx)
})

export default bot

console.log("BOT STARTED")
bot.start()