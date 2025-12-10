import { botClient } from "./botClient.js"

console.log(">>> botClient =", botClient)
console.log(">>> type =", typeof botClient)

if (!botClient) {
    console.log("botClient === undefined !!!")
}