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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageLogEntity = void 0;
const typeorm_1 = require("typeorm");
let MessageLogEntity = class MessageLogEntity {
};
exports.MessageLogEntity = MessageLogEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], MessageLogEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'telegram_message_id' }),
    __metadata("design:type", Number)
], MessageLogEntity.prototype, "telegramMessageId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'telegram_chat_id' }),
    __metadata("design:type", Number)
], MessageLogEntity.prototype, "telegramChatId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sender_telegram_id' }),
    __metadata("design:type", String)
], MessageLogEntity.prototype, "senderTelegramId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sender_role_at_moment' }),
    __metadata("design:type", String)
], MessageLogEntity.prototype, "senderRoleAtMoment", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sent_at' }),
    __metadata("design:type", Date)
], MessageLogEntity.prototype, "sentAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'text_content', nullable: true }),
    __metadata("design:type", Object)
], MessageLogEntity.prototype, "textContent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transcribed_text', type: 'text', nullable: true }),
    __metadata("design:type", String)
], MessageLogEntity.prototype, "transcribed_text", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_reply_to_message_id', nullable: true }),
    __metadata("design:type", Object)
], MessageLogEntity.prototype, "isReplyToMessageId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'has_attachments', default: false }),
    __metadata("design:type", Boolean)
], MessageLogEntity.prototype, "hasAttachments", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'attachment_type', nullable: true }),
    __metadata("design:type", Object)
], MessageLogEntity.prototype, "attachmentType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_question', default: false }),
    __metadata("design:type", Boolean)
], MessageLogEntity.prototype, "isQuestion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'question_status', type: 'enum', enum: ['PENDING', 'ANSWERED', 'TIMEOUT'], default: 'PENDING' }),
    __metadata("design:type", String)
], MessageLogEntity.prototype, "questionStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'answered_by_message_id', nullable: true }),
    __metadata("design:type", Object)
], MessageLogEntity.prototype, "answeredByMessageId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'response_time_seconds', nullable: true }),
    __metadata("design:type", Object)
], MessageLogEntity.prototype, "responseTimeSeconds", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'answer_detection_method', nullable: true }),
    __metadata("design:type", Object)
], MessageLogEntity.prototype, "answerDetectionMethod", void 0);
exports.MessageLogEntity = MessageLogEntity = __decorate([
    (0, typeorm_1.Entity)('message_log')
], MessageLogEntity);
