import mainMenuKeyboard from "../keyboards/mainMenu.js";

export default async function startHandler(ctx) {
    await ctx.reply(
        "Выберите интересующий раздел:", {
            format: "html",
            attachments: [mainMenuKeyboard()]
        }
    );
}