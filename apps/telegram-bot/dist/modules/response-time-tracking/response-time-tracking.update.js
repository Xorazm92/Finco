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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseTimeTrackingUpdate = void 0;
const nestjs_telegraf_1 = require("nestjs-telegraf");
const telegraf_1 = require("telegraf");
const response_time_tracking_service_1 = require("./response-time-tracking.service");
let ResponseTimeTrackingUpdate = class ResponseTimeTrackingUpdate {
    responseTimeService;
    constructor(responseTimeService) {
        this.responseTimeService = responseTimeService;
    }
    async onText(ctx) {
        if (!ctx.message?.reply_to_message) {
            this.responseTimeService.onQuestion(ctx);
        }
        else {
            const responseTime = this.responseTimeService.onAnswer(ctx);
            if (responseTime !== null) {
                await ctx.reply(`Javob vaqti: ${responseTime} soniya`);
            }
        }
    }
};
exports.ResponseTimeTrackingUpdate = ResponseTimeTrackingUpdate;
__decorate([
    (0, nestjs_telegraf_1.On)('text'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], ResponseTimeTrackingUpdate.prototype, "onText", null);
exports.ResponseTimeTrackingUpdate = ResponseTimeTrackingUpdate = __decorate([
    (0, nestjs_telegraf_1.Update)(),
    __metadata("design:paramtypes", [response_time_tracking_service_1.ResponseTimeTrackingService])
], ResponseTimeTrackingUpdate);
//# sourceMappingURL=response-time-tracking.update.js.map