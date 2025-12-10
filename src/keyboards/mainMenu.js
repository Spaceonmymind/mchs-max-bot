import { Keyboard } from "@maxhub/max-bot-api"
import { QUESTIONS } from "../data/questions.js"

export default function mainMenuKeyboard() {
    const rows = []

    rows.push([
        Keyboard.button.callback("✉️ Отправить сообщение", "send_message")
    ])

    rows.push([
        Keyboard.button.callback("🚁 Сообщить о падении дрона", "drone_report")
    ])

    for (const id in QUESTIONS) {
        const icon = "📂"
        const name = QUESTIONS[id].name

        rows.push([
            Keyboard.button.callback(`${icon} ${name}`, `cat:${id}`)
        ])
    }

    return Keyboard.inlineKeyboard(rows)
}