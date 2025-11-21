import { Bot } from "@maxhub/max-bot-api";
import dotenv from "dotenv";
import fs from "fs";

import startHandler from "./src/handlers/start.js";
import categoryHandler from "./src/handlers/categoryHandler.js";
import topicHandler from "./src/handlers/topicHandler.js";

dotenv.config();

const bot = new Bot(process.env.BOT_TOKEN);

const logoPath = "/Users/egorgladkih/Visual Studo Projects/mchs-max-bot/assets/logo.png";

bot.on("bot_started", async(ctx) => {
    try {
        const buffer = fs.readFileSync(logoPath);

        const image = await ctx.api.uploadImage({
            source: buffer
        });

        await ctx.reply(
            "<b>Чат-бот Департамента гражданской защиты Курганской области</b>\n\n" +
            "Этот бот поможет вам:\n" +
            "• правильно действовать при чрезвычайных ситуациях;\n" +
            "• определить, какую службу вызвать;\n" +
            "• узнать возможности единого номера <b>112</b>.\n\n", {
                format: "html",
                attachments: [image.toJson()]
            }
        );

        await startHandler(ctx);

    } catch (err) {
        console.log("Ошибка загрузки логотипа:", err);

        await ctx.reply(
            "<b>Чат-бот Департамента гражданской защиты Курганской области</b>\n\n" +
            "Добро пожаловать. Логотип не удалось загрузить.", { format: "html" }
        );

        await startHandler(ctx);
    }
});

bot.command("start", async(ctx) => {
    return startHandler(ctx);
});

bot.action(/cat:(.+)/, async(ctx) => {
    const categoryId = ctx.match[1];
    return categoryHandler(ctx, categoryId);
});

bot.action(/topic:(.+):(.+)/, async(ctx) => {
    const categoryId = ctx.match[1];
    const topicId = ctx.match[2];
    return topicHandler(ctx, categoryId, topicId);
});

bot.action(/back:(.+)/, async(ctx) => {
    const target = ctx.match[1];
    if (target === "main") {
        return startHandler(ctx);
    }
});


bot.on("message_created", async(ctx, next) => {
    let text = null

    if (ctx.message && ctx.message.body && ctx.message.body.text) {
        text = ctx.message.body.text
    }

    if (text) {
        if (text.indexOf("/start") === 0) {
            return next()
        }

        await ctx.reply(
            "Я не обрабатываю текстовые сообщения\nПожалуйста используйте меню ниже", { format: "html" }
        )

        return startHandler(ctx)
    }

    return next()
})



console.log("BOT STARTED");
bot.start();