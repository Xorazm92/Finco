"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TelegramController_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramController = void 0;
const common_1 = require("@nestjs/common");
const nestjs_telegraf_1 = require("nestjs-telegraf");
const telegram_service_1 = require("./telegram.service");
const user_service_1 = require("../user-management/user.service");
const message_log_service_1 = require("../message-log/message-log.service");
const ai_queue_service_1 = require("../artificial-intelligence/ai-queue.service");
const telegraf_1 = require("telegraf");
let TelegramController = TelegramController_1 = class TelegramController {
    telegramService;
    userService;
    messageLogService;
    aiQueueService;
    queue;
    logger = new common_1.Logger(TelegramController_1.name);
    constructor(telegramService, userService, messageLogService, aiQueueService, queue) {
        this.telegramService = telegramService;
        this.userService = userService;
        this.messageLogService = messageLogService;
        this.aiQueueService = aiQueueService;
        this.queue = queue;
    }
    async handleUpdate(update) {
        if (!update?.message || !update.message.chat || !update.message.from) {
            this.logger.warn('Noto‘g‘ri Telegram update:', update);
            return { ok: false, error: 'Invalid update' };
        }
        if (this.queue) {
            await this.queue.add('incoming', update);
            this.logger.log(`Xabar queue ga yuborildi: chat_id=${update.message.chat.id}, from_id=${update.message.from.id}`);
        }
        else {
            this.logger.warn('Bull queue mavjud emas, xabar queue ga yuborilmadi!');
        }
        return { ok: true };
    }
    getStats() {
        return {
            users: 0,
            messages: 0,
            status: 'ok',
            time: new Date().toISOString(),
        };
    }
    async onMessage(ctx) {
        const msg = ctx.message;
        if (!msg || !('chat' in msg) || !msg.from)
            return;
        const chatId = String(msg.chat.id);
        const telegramUserId = String(msg.from.id);
        const { user, userChatRole } = await this.userService.findOrCreateUserFromTelegramContext(msg);
        const hasText = typeof msg === 'object' && 'text' in msg && typeof msg.text === 'string';
        const isPotentialQuestion = hasText && (msg.text.includes('?') ||
            /mi\?|qachon|qanday|nima uchun/i.test(msg.text));
        const textContent = (hasText ? msg.text : null);
        const isReplyToMessageId = (typeof msg === 'object' && 'reply_to_message' in msg && msg.reply_to_message && 'message_id' in msg.reply_to_message) ? msg.reply_to_message.message_id : null;
        const hasDocument = typeof msg === 'object' && 'document' in msg && !!msg.document;
        const hasPhoto = typeof msg === 'object' && 'photo' in msg && !!msg.photo;
        const hasAudio = typeof msg === 'object' && 'audio' in msg && !!msg.audio;
        const hasVoice = typeof msg === 'object' && 'voice' in msg && !!msg.voice;
        const hasAttachments = hasDocument || hasPhoto || hasAudio || hasVoice;
        let attachmentType = null;
        if (hasDocument)
            attachmentType = 'document';
        else if (hasPhoto)
            attachmentType = 'photo';
        else if (hasAudio)
            attachmentType = 'audio';
        else if (hasVoice)
            attachmentType = 'voice';
        const messageLog = await this.messageLogService.logMessage({
            telegramMessageId: msg.message_id,
            telegramChatId: Number(chatId),
            senderTelegramId: telegramUserId,
            senderRoleAtMoment: userChatRole.role,
            sentAt: new Date(msg.date * 1000),
            textContent,
            isReplyToMessageId,
            hasAttachments,
            attachmentType,
            isQuestion: isPotentialQuestion,
        });
        if (isPotentialQuestion && hasText) {
            await this.aiQueueService.addSentimentJob(msg.text);
        }
        const hasReplyTo = typeof msg === 'object' && 'reply_to_message' in msg && !!msg.reply_to_message;
        if (hasReplyTo && hasText) {
            await this.aiQueueService.addSentimentJob(msg.text);
        }
        else {
            if (["ACCOUNTANT", "BANK_CLIENT", "BANK_CLIENT_SPECIALIST"].includes(userChatRole.role) && hasText) {
                await this.aiQueueService.addSentimentJob(msg.text);
            }
        }
        await this.telegramService.sendMessage(chatId, 'Bot xabaringizni oldi!');
    }
};
exports.TelegramController = TelegramController;
__decorate([
    (0, common_1.Post)('webhook'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramController.prototype, "handleUpdate", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TelegramController.prototype, "getStats", null);
__decorate([
    (0, nestjs_telegraf_1.On)('message'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], TelegramController.prototype, "onMessage", null);
exports.TelegramController = TelegramController = TelegramController_1 = __decorate([
    (0, common_1.Controller)('telegram'),
    (0, nestjs_telegraf_1.Update)(),
    __param(4, (0, common_1.Inject)('BullQueue_incoming_messages_queue')),
    __metadata("design:paramtypes", [telegram_service_1.TelegramService, typeof (_a = typeof user_service_1.UserService !== "undefined" && user_service_1.UserService) === "function" ? _a : Object, typeof (_b = typeof message_log_service_1.MessageLogService !== "undefined" && message_log_service_1.MessageLogService) === "function" ? _b : Object, typeof (_c = typeof ai_queue_service_1.AiQueueService !== "undefined" && ai_queue_service_1.AiQueueService) === "function" ? _c : Object, Object])
], TelegramController);
//# sourceMappingURL=telegram.controller.js.map