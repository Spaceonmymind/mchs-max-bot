import subMenuKeyboard from "../keyboards/subMenu.js"
import { QUESTIONS } from "../data/questions.js"

export default async function categoryHandler(ctx, categoryId) {
    const category = QUESTIONS[categoryId]

    await ctx.reply(
        `<b>${category.name}</b>\n\nВыберите вопрос:`, {
            format: "html",
            attachments: [subMenuKeyboard(categoryId)]
        }
    )
}