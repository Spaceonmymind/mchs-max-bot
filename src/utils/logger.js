export function logAction(userId, action, extra) {
    const time = new Date().toISOString();

    console.log(
        "📝 ACTION",
        "| time:", time,
        "| user:", userId ? userId : "unknown",
        "| type:", action,
        "| extra:", extra ? extra : {}
    );
}