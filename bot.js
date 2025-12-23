import { Bot } from "@maxhub/max-bot-api"
import dotenv from "dotenv"
import fs from "fs"

import startHandler from "./src/handlers/start.js"
import categoryHandler from "./src/handlers/categoryHandler.js"
import topicHandler from "./src/handlers/topicHandler.js"
import messageHandler from "./src/handlers/messageHandler.js"

import { setState, clearState, getState } from "./src/utils/state.js"
import { getChatId } from "./src/utils/getChatId.js"
import { cleanChat } from "./src/utils/cleanChat.js"

dotenv.config()

const bot = new Bot(process.env.BOT_TOKEN)
const logoPath = "/Users/egorgladkih/Visual Studo Projects/mchs-max-bot/assets/logo.png"

console.log("BOOTING BOT")

/**
 * 🔴 GLOBAL RAW UPDATE LOGGER
 */
bot.use(async(ctx, next) => {
    try {
        console.log("========== RAW UPDATE ==========")
        console.log(JSON.stringify(ctx.update, null, 2))
        console.log("================================")
    } catch (e) {
        console.log("RAW UPDATE LOG ERROR", e)
    }
    await next()
})

/**
 * BOT START
 */
bot.on("bot_started", async(ctx) => {
    console.log("EVENT bot_started")

    try {
        const buffer = fs.readFileSync(logoPath)
        const image = await ctx.api.uploadImage({ source: buffer })

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
    } catch (err) {
        console.log("LOGO ERROR", err)
        await ctx.reply(
            "<b>Чат-бот Департамента гражданской защиты Курганской области</b>\nДобро пожаловать!", { format: "html" }
        )
    }

    await startHandler(ctx)
})

/**
 * /start
 */
bot.command("start", async(ctx) => {
    console.log("COMMAND /start")

    const chatId = getChatId(ctx)
    console.log("chatId", chatId)

    if (chatId) {
        clearState(chatId)
        console.log("STATE CLEARED")
    }

    return startHandler(ctx)
})

/**
 * КНОПКА: ПРОИЗВОЛЬНОЕ СООБЩЕНИЕ
 */
bot.action("send_message", async(ctx) => {
    console.log("ACTION send_message")

    const chatId = getChatId(ctx)
    console.log("chatId", chatId)

    if (!chatId) return

    await cleanChat(ctx)

    setState(chatId, {
        step: "await_phone",
        type: "custom"
    })

    console.log("STATE SET", getState(chatId))

    await ctx.reply("Пожалуйста, укажите ваш номер телефона в формате +7XXXXXXXXXX")
})

/**
 * КНОПКА: СООБЩЕНИЕ О ДРОНЕ
 */
bot.action("drone_report", async(ctx) => {
    console.log("ACTION drone_report")

    const chatId = getChatId(ctx)
    console.log("chatId", chatId)

    if (!chatId) return

    await cleanChat(ctx)

    setState(chatId, {
        step: "await_phone",
        type: "drone"
    })

    console.log("STATE SET", getState(chatId))

    await ctx.reply("Пожалуйста, укажите ваш номер телефона в формате +7XXXXXXXXXX")
})

/**
 * КАТЕГОРИИ
 */
bot.action(/cat:(.+)/, async(ctx) => {
    console.log("ACTION cat", ctx.match)
    return categoryHandler(ctx, ctx.match[1])
})

/**
 * ТОПИКИ
 */
bot.action(/topic:(.+):(.+)/, async(ctx) => {
    console.log("ACTION topic", ctx.match)
    return topicHandler(ctx, ctx.match[1], ctx.match[2])
})

/**
 * НАЗАД В ГЛАВНОЕ МЕНЮ
 */
bot.action(/back:(.+)/, async(ctx) => {
    console.log("ACTION back", ctx.match)

    if (ctx.match[1] === "main") {
        const chatId = getChatId(ctx)
        if (chatId) {
            clearState(chatId)
            console.log("STATE CLEARED")
        }
        return startHandler(ctx)
    }
})

/**
 * 🔴 ВСЕ СООБЩЕНИЯ (UNIVERSAL)
 * MAX реально шлёт И message, И message_created
 * ОБА ведём в один handler
 */
async function handleAnyMessage(ctx, source) {
    console.log(`EVENT ${source}`)
    console.log("MESSAGE PAYLOAD", JSON.stringify(ctx.message, null, 2))

    const chatId = getChatId(ctx)
    console.log("chatId", chatId)

    if (chatId) {
        console.log("CURRENT STATE", getState(chatId))
    }

    await messageHandler(ctx)
}

bot.on("message", async(ctx) => {
    await handleAnyMessage(ctx, "message")
})

bot.on("message_created", async(ctx) => {
    await handleAnyMessage(ctx, "message_created")
})

export default bot

console.log("BOT STARTED")
bot.start()