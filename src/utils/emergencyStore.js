// src/utils/emergencyStore.js

import fs from "fs";
import path from "path";
import { logAction } from "./logger.js";

const FILE_PATH = path.resolve("src/data/emergencies.json");

let emergencies = [];
let dirty = false;

function loadFromDisk() {
    try {
        if (!fs.existsSync(FILE_PATH)) {
            emergencies = [];
            return;
        }

        const raw = fs.readFileSync(FILE_PATH, "utf-8");
        const parsed = JSON.parse(raw);

        if (Array.isArray(parsed)) {
            emergencies = parsed;
        } else {
            emergencies = [];
        }
    } catch (err) {
        console.error("Failed to load emergencies", err);
        emergencies = [];
    }
}

function flushToDisk() {
    if (!dirty) return;

    const data = JSON.stringify(emergencies, null, 2);
    dirty = false;

    fs.writeFile(FILE_PATH, data, "utf-8", function(err) {
        if (err) {
            console.error("Failed to save emergencies", err);
            dirty = true;
        }
    });
}

setInterval(flushToDisk, 3000);

loadFromDisk();

export async function saveEmergency(emergency) {
    if (!emergency) return;

    emergencies.push(emergency);
    dirty = true;

    logAction(
        emergency.chatId,
        "emergency_saved", {
            type: emergency.type
        }
    );
}

export function getEmergencies() {
    return emergencies;
}

export function updateEmergencyStatus(index, status) {
    if (typeof index !== "number") return;
    if (!emergencies[index]) return;

    emergencies[index].status = status;
    dirty = true;
}