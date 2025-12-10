import categoryHandler from "./categoryHandler.js"
import topicHandler from "./topicHandler.js"
import startHandler from "./start.js"
import { setState } from "../utils/state.js"

export default async function callbackRouter(ctx) {
    let data = null

    if (ctx.update && ctx.update.callback_query && ctx.update.callback_query.data) {
        data = ctx.update.callback_query.data
    }

    if (!data) {
        return
    }

    if (data === "send_message") {
        setState(ctx.chat.id, "mode", "await_message")
        setState(ctx.chat.id, "type", "custom")
        await ctx.reply("Пожалуйста напишите ваше сообщение")
        return
    }

    if (data === "drone_report") {
        setState(ctx.chat.id, "mode", "await_message")
        setState(ctx.chat.id, "type", "drone")
        await ctx.reply("Опишите место время и обстоятельства падения дрона")
        return
    }

    if (data.indexOf("cat:") === 0) {
        const parts = data.split(":")
        return categoryHandler(ctx, parts[1])
    }

    if (data.indexOf("topic:") === 0) {
        const parts = data.split(":")
        return topicHandler(ctx, parts[1], parts[2])
    }

    if (data.indexOf("back:") === 0) {
        const target = data.split(":")[1]
        if (target === "main") {
            return startHandler(ctx)
        }
    }
}