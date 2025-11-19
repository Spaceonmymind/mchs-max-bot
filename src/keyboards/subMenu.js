import { Keyboard } from "@maxhub/max-bot-api"
import { QUESTIONS } from "../data/questions.js"
import backButton from "./backButton.js"

export default function subMenuKeyboard(categoryId) {
    const rows = []
    const topics = QUESTIONS[categoryId].topics

    for (const topicId in topics) {
        const title = topics[topicId]
        rows.push([
            Keyboard.button.callback(`❓ ${title}`, `topic:${categoryId}:${topicId}`)
        ])
    }

    rows.push([backButton("main")])

    return Keyboard.inlineKeyboard(rows)
}