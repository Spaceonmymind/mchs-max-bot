import { Keyboard } from "@maxhub/max-bot-api"
import { QUESTIONS } from "../data/questions.js"

export default function mainMenuKeyboard() {
    const rows = []

    for (const id in QUESTIONS) {
        const icon = "📂"
        const name = QUESTIONS[id].name

        rows.push([
            Keyboard.button.callback(`${icon} ${name}`, `cat:${id}`)
        ])
    }

    return Keyboard.inlineKeyboard(rows)
}