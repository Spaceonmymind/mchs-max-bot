import categoryHandler from "./categoryHandler.js";
import topicHandler from "./topicHandler.js";
import startHandler from "./start.js";

export default async function callbackRouter(ctx) {
    let data = null;

    if (ctx.update && ctx.update.callback_query && ctx.update.callback_query.data) {
        data = ctx.update.callback_query.data;
    }

    if (!data) {
        return;
    }

    if (data.indexOf("cat:") === 0) {
        const parts = data.split(":");
        return categoryHandler(ctx, parts[1]);
    }

    if (data.indexOf("topic:") === 0) {
        const parts = data.split(":");
        return topicHandler(ctx, parts[1], parts[2]);
    }

    if (data.indexOf("back:") === 0) {
        const target = data.split(":")[1];
        if (target === "main") return startHandler(ctx);
    }
}