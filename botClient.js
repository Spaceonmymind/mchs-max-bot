import { Bot } from "@maxhub/max-bot-api"
import dotenv from "dotenv"
dotenv.config()

export const botClient = new Bot(process.env.BOT_TOKEN)