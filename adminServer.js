import express from "express"
import fs from "fs"
import path from "path"
import { botClient } from "./botClient.js"

const app = express()
const PORT = 3030

app.use(express.json())

const dataFile = path.resolve("src/data/emergencies.json")

function loadEmergencies() {
    try {
        if (!fs.existsSync(dataFile)) return []
        const raw = fs.readFileSync(dataFile, "utf8")
        if (!raw.trim()) return []
        return JSON.parse(raw)
    } catch (err) {
        console.log("Ошибка чтения emergencies.json:", err)
        return []
    }
}

function saveEmergencies(list) {
    try {
        fs.writeFileSync(dataFile, JSON.stringify(list, null, 2))
    } catch (err) {
        console.log("Ошибка записи emergencies.json:", err)
    }
}

app.get("/admin", (req, res) => {
    const list = loadEmergencies()

    let html = `
        <html>
        <head>
            <meta charset="utf-8" />
            <title>Обращения граждан</title>
            <style>
                body { font-family: Arial; padding: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ccc; padding: 6px; }
                th { background: #f3f3f3; }
                .new { background: #ffecec; }
                .read { background: #ecffec; }
                .answered { background: #e7f0ff; }
                button { margin-top: 5px; }
            </style>
        </head>
        <body>
            <h1>Обращения граждан</h1>

            <table>
                <tr>
                    <th>Тип</th>
                    <th>Телефон</th>
                    <th>Сообщение</th>
                    <th>Время</th>
                    <th>Действия</th>
                </tr>
    `

    for (const item of list) {
        const time = new Date(item.timestamp).toLocaleString()
        html += `
            <tr class="${item.status}">
                <td>${item.type}</td>
                <td>${item.phone}</td>
                <td>${item.message}</td>
                <td>${time}</td>
                <td>
                    <b>${item.status}</b><br>
                    <button onclick="markRead(${item.timestamp})">Отметить</button><br>
                    <button onclick="reply(${item.timestamp})">Ответить</button>
                </td>
            </tr>
        `
    }

    html += `
            </table>

            <script>
                function markRead(id) {
                    fetch("/admin/mark-read", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id })
                    }).then(() => location.reload())
                }

                function reply(id) {
                    const text = prompt("Введите текст ответа гражданину")
                    if (!text) return

                    fetch("/admin/reply", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id, text })
                    }).then(() => location.reload())
                }
            </script>

        </body>
        </html>
    `

    res.setHeader("Content-Type", "text/html; charset=utf-8")
    return res.send(html)
})

app.post("/admin/mark-read", (req, res) => {
    const { id } = req.body

    const list = loadEmergencies()
    const item = list.find(x => x.timestamp === id)

    if (!item) return res.json({ ok: false })

    item.status = "read"
    saveEmergencies(list)

    return res.json({ ok: true })
})

app.post("/admin/reply", async(req, res) => {
    const { id, text } = req.body

    const list = loadEmergencies()
    const item = list.find(x => x.timestamp === id)

    if (!item) return res.json({ ok: false })

    try {
        // ВАЖНО: передаём просто строку
        await botClient.api.sendMessageToChat(item.chatId, text)

        item.status = "answered"
        saveEmergencies(list)
        return res.json({ ok: true })

    } catch (err) {
        console.log("Ошибка отправки ответа пользователю:", err)
        return res.json({ ok: false })
    }
})

app.listen(PORT, () => {
    console.log("Admin panel running: http://localhost:" + PORT + "/admin")
})