import fs from "fs"
import path from "path"

const filePath = path.resolve("src/data/emergencies.json")

function loadData() {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, "[]")
        return []
    }

    try {
        const raw = fs.readFileSync(filePath, "utf8")
        if (!raw.trim()) {
            fs.writeFileSync(filePath, "[]")
            return []
        }

        return JSON.parse(raw)
    } catch (e) {
        fs.writeFileSync(filePath, "[]")
        return []
    }
}

export function saveEmergency(record) {
    const data = loadData()
    data.push(record)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

export function getEmergencies() {
    return loadData()
}