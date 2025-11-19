import { QUESTIONS } from "../data/questions.js"

export default async function topicHandler(ctx, categoryId, topicId) {
    const answer = QUESTIONS[categoryId].answers[topicId]

    await ctx.reply(answer, {
        format: "html"
    })
}