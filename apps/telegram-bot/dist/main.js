"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const telegram_module_1 = require("./modules/telegram.module");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    const app = await core_1.NestFactory.create(telegram_module_1.TelegramModule, {
        bufferLogs: true,
    });
    app.useLogger(app.get(common_1.Logger));
    await app.listen(3001);
    common_1.Logger.log('Telegram bot NestJS ilovasi ishga tushdi!');
}
bootstrap();
//# sourceMappingURL=main.js.map