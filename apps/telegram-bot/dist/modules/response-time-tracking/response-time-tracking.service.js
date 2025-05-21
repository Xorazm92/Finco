"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ResponseTimeTrackingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseTimeTrackingService = void 0;
const common_1 = require("@nestjs/common");
let ResponseTimeTrackingService = ResponseTimeTrackingService_1 = class ResponseTimeTrackingService {
    logger = new common_1.Logger(ResponseTimeTrackingService_1.name);
    questionTimestamps = new Map();
    onQuestion(ctx) {
        const messageId = ctx.message?.message_id;
        if (messageId) {
            this.questionTimestamps.set(messageId, Date.now());
            this.logger.log(`Question logged: messageId=${messageId}`);
        }
    }
    onAnswer(ctx) {
        const replyTo = ctx.message?.reply_to_message?.message_id;
        if (replyTo && this.questionTimestamps.has(replyTo)) {
            const questionTime = this.questionTimestamps.get(replyTo);
            const answerTime = Date.now();
            const responseTimeSec = Math.round((answerTime - questionTime) / 1000);
            this.logger.log(`Answer received for messageId=${replyTo}, responseTime=${responseTimeSec}s`);
            this.questionTimestamps.delete(replyTo);
            return responseTimeSec;
        }
        return null;
    }
};
exports.ResponseTimeTrackingService = ResponseTimeTrackingService;
exports.ResponseTimeTrackingService = ResponseTimeTrackingService = ResponseTimeTrackingService_1 = __decorate([
    (0, common_1.Injectable)()
], ResponseTimeTrackingService);
//# sourceMappingURL=response-time-tracking.service.js.map