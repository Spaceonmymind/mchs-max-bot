export function getChatId(ctx) {
    if (ctx.chat && ctx.chat.id) {
        return ctx.chat.id
    }

    if (ctx.update) {
        if (ctx.update.message && ctx.update.message.recipient && ctx.update.message.recipient.chat_id) {
            return ctx.update.message.recipient.chat_id
        }

        if (ctx.update.callback && ctx.update.callback.message && ctx.update.callback.message.recipient) {
            return ctx.update.callback.message.recipient.chat_id
        }

        if (ctx.update.callback_query && ctx.update.callback_query.message && ctx.update.callback_query.message.recipient) {
            return ctx.update.callback_query.message.recipient.chat_id
        }
    }

    return null
}