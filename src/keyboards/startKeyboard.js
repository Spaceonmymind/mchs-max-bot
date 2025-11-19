import { Keyboard } from "@maxhub/max-bot-api"

export default function startKeyboard() {
    return Keyboard.inlineKeyboard([
        [Keyboard.button.callback("Начать", "start_bot")]
    ])
}