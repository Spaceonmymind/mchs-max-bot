// utils/emergencyStore.js

import fs from 'fs';
import path from 'path';
import { logger } from './logger.js';

const FILE_PATH = path.resolve('src/data/emergencies.json');

/**
 * Хранилище в памяти
 */
let emergencies = [];

/**
 * Флаг, что есть изменения
 */
let dirty = false;

/**
 * Загрузка данных при старте бота
 */
function loadFromDisk() {
    try {
        if (!fs.existsSync(FILE_PATH)) {
            emergencies = [];
            return;
        }

        const raw = fs.readFileSync(FILE_PATH, 'utf-8');
        emergencies = JSON.parse(raw);

        if (!Array.isArray(emergencies)) {
            emergencies = [];
        }
    } catch (err) {
        logger.error('Failed to load emergencies', err);
        emergencies = [];
    }
}

/**
 * Асинхронная запись на диск
 */
function flushToDisk() {
    if (!dirty) return;

    const data = JSON.stringify(emergencies, null, 2);
    dirty = false;

    fs.writeFile(FILE_PATH, data, 'utf-8', function(err) {
        if (err) {
            logger.error('Failed to save emergencies', err);
            dirty = true;
        }
    });
}

/**
 * Автосброс на диск раз в 3 секунды
 */
setInterval(flushToDisk, 3000);

/**
 * Инициализация при импорте
 */
loadFromDisk();

/**
 * Сохранить новое обращение
 */
export async function saveEmergency(emergency) {
    if (!emergency) return;

    emergencies.push(emergency);
    dirty = true;

    logger.info('Emergency saved', {
        chatId: emergency.chatId,
        type: emergency.type
    });
}

/**
 * Получить все обращения
 */
export function getEmergencies() {
    return emergencies;
}

/**
 * Обновить статус обращения
 */
export function updateEmergencyStatus(index, status) {
    if (typeof index !== 'number') return;
    if (!emergencies[index]) return;

    emergencies[index].status = status;
    dirty = true;
}