import { registerAs } from '@nestjs/config';

export default registerAs('telegram', () => ({
  botToken: process.env.TELEGRAM_BOT_TOKEN,
  adminChatId: process.env.TELEGRAM_ADMIN_CHAT_ID,
  allowedChatIds: process.env.TELEGRAM_ALLOWED_CHAT_IDS?.split(',') || [],
}));
