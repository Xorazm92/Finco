import { Telegraf } from 'telegraf';
import * as dotenv from 'dotenv';
dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);

bot.start((ctx) => ctx.reply('Salom! Telegram bot ishlayapti.'));
bot.on('text', (ctx) => ctx.reply('Xabar qabul qilindi.'));

bot.launch();
console.log('Telegram bot ishga tushdi!');
