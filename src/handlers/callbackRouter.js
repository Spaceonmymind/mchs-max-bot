import { setState, clearState } from '../utils/state.js';
import { send } from '../utils/send.js';
import { logger } from '../utils/logger.js';

export async function callbackRouter(ctx) {
    if (!ctx || !ctx.chat || !ctx.callbackQuery || !ctx.callbackQuery.data) {
        return;
    }

    const chatId = ctx.chat.id;
    const data = ctx.callbackQuery.data;

    logger.info('[CALLBACK]', {
        chatId: chatId,
        data: data
    });

    // --- КНОПКА НАЗАД ---
    if (data === 'back') {
        clearState(chatId);
        await send(ctx, 'Вы вернулись в главное меню');
        return;
    }

    // --- КАТЕГОРИЯ ДРОН ---
    if (data === 'category_drone') {
        setState(chatId, {
            step: 'await_message',
            type: 'drone'
        });

        await send(ctx, 'Опишите ситуацию с дроном');
        return;
    }

    // --- ПРОИЗВОЛЬНОЕ СООБЩЕНИЕ ---
    if (data === 'category_custom') {
        setState(chatId, {
            step: 'await_message',
            type: 'custom'
        });

        await send(ctx, 'Опишите ситуацию');
        return;
    }

    // --- НЕИЗВЕСТНЫЙ CALLBACK ---
    logger.warn('[UNKNOWN CALLBACK]', {
        chatId: chatId,
        data: data
    });

    clearState(chatId);
    await send(ctx, 'Неизвестная команда. Пожалуйста начните заново');
}