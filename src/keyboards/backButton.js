import { Keyboard } from "@maxhub/max-bot-api"

export default function backButton(target) {
    return Keyboard.button.callback("⬅️ Назад", `back:${target}`)
}