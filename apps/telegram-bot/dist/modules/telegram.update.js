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
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramUpdate = void 0;
const nestjs_telegraf_1 = require("nestjs-telegraf");
const telegraf_1 = require("telegraf");
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../../shared/decorators/roles.decorator");
const roles_guard_1 = require("../../shared/guards/roles.guard");
const user_role_enum_1 = require("../../shared/enums/user-role.enum");
const response_time_service_1 = require("../kpi-response-time/response-time.service");
const user_service_1 = require("../user-management/user.service");
const ai_queue_service_1 = require("../artificial-intelligence/ai-queue.service");
const ai_analysis_result_service_1 = require("../artificial-intelligence/ai-analysis-result.service");
const human_feedback_service_1 = require("../artificial-intelligence/human-feedback.service");
const telegraf_2 = require("telegraf");
const report_submission_service_1 = require("../kpi-report-submission/report-submission.service");
const attendance_log_service_1 = require("../attendance-log/attendance-log.service");
const audit_log_service_1 = require("../audit-log/audit-log.service");
let TelegramUpdate = class TelegramUpdate {
    responseTimeService;
    userService;
    aiQueueService;
    aiAnalysisResultService;
    humanFeedbackService;
    kpiCalculationService;
    reportSubmissionService;
    attendanceLogService;
    auditLogService;
    constructor(responseTimeService, userService, aiQueueService, aiAnalysisResultService, humanFeedbackService, kpiCalculationService, reportSubmissionService, attendanceLogService, auditLogService) {
        this.responseTimeService = responseTimeService;
        this.userService = userService;
        this.aiQueueService = aiQueueService;
        this.aiAnalysisResultService = aiAnalysisResultService;
        this.humanFeedbackService = humanFeedbackService;
        this.kpiCalculationService = kpiCalculationService;
        this.reportSubmissionService = reportSubmissionService;
        this.attendanceLogService = attendanceLogService;
        this.auditLogService = auditLogService;
    }
    async onStart(ctx) {
        await ctx.reply("FinCo KPI botiga xush kelibsiz! /help buyrug'i bilan yordam olishingiz mumkin.");
    }
    async onHelp(ctx) {
        await ctx.reply('Bot yordamchisi: \n/start - Botni boshlash\n/help - Yordam\nSavollar uchun xabar yuboring.');
    }
    async onMessage(message, ctx) {
        await this.responseTimeService.processMessage(message, ctx);
        if (message.reply_to_message && message.text) {
            const job = await this.aiQueueService.addSentimentJob(message.text);
        }
    }
    async reviewAiResults(ctx) {
        const args = ctx.message && 'text' in ctx.message ? ctx.message.text.split(' ') : [];
        const limit = args.length > 1 ? parseInt(args[1]) || 5 : 5;
        const results = await this.aiAnalysisResultService.findLatest(undefined, limit);
        if (!results.length)
            return ctx.reply('SI natijalari topilmadi.');
        for (const r of results) {
            const text = `ID: ${r.id}, Natija: ${JSON.stringify(r.result).slice(0, 80)}`;
            await ctx.reply(text, telegraf_2.Markup.inlineKeyboard([
                [
                    telegraf_2.Markup.button.callback('✅ Tasdiqlash', `feedback:${r.id}:approve`),
                    telegraf_2.Markup.button.callback('❌ Rad etish', `feedback:${r.id}:reject`)
                ]
            ]));
        }
    }
    async analyzeSentiment(ctx) {
        const text = ctx.message && 'text' in ctx.message ? ctx.message.text.replace('/analyze_sentiment', '').trim() : '';
        if (!text)
            return ctx.reply('Matn kiriting: /analyze_sentiment <matn>');
        const job = await this.aiQueueService.addSentimentJob(text);
        ctx.reply(`Sizning so'rovingiz (ID: ${job.id}) navbatga qo'yildi. Natijani /get_analysis_result ${job.id} orqali tekshirishingiz mumkin.`);
    }
    async getAnalysisResult(ctx) {
        const args = ctx.message && 'text' in ctx.message ? ctx.message.text.split(' ') : [];
        if (!args || args.length < 2)
            return ctx.reply('Job ID kiriting: /get_analysis_result <job_id>');
        const jobId = args[1];
        const result = await this.aiQueueService.getJobResult(jobId);
        if (result.error)
            return ctx.reply('Natija topilmadi.');
        if (result.state !== 'completed')
            return ctx.reply(`Holat: ${result.state}. Natija tayyor emas.`);
        ctx.reply(`Natija: ${JSON.stringify(result.result)}`);
    }
    async assignRole(ctx, text) {
        const [_, target, role] = text.split(' ');
        let user;
        if (target.startsWith('@')) {
            user = await this.userService.findByTelegramIdOrUsername(target.replace('@', ''));
        }
        else {
            user = await this.userService.findByTelegramIdOrUsername(target);
        }
        if (!user)
            return ctx.reply('Foydalanuvchi topilmadi');
        if (!ctx.chat || !ctx.from)
            return;
        const chatId = String(ctx.chat.id);
        const oldRole = await this.userService.getUserRoleInChat(user.id, chatId);
        await this.userService.assignRoleToUserInChat(user.id, chatId, role, String(ctx.from.id));
        await this.auditLogService.logAction('ROLE_CHANGED', String(ctx.from?.id), String(user.id), {
            oldRole: oldRole ?? '-',
            newRole: role,
            chatId,
            reason: 'Role assignment via bot',
        });
        ctx.reply(`${target} uchun rol: ${role} tayinlandi`);
    }
    async auditLog(ctx) {
        const args = ctx.message && 'text' in ctx.message ? ctx.message.text.split(' ') : [];
        if (args.length < 2)
            return ctx.reply('Foydalanuvchini kiriting: /audit_log <user_id|username>');
        const target = args[1];
        let logs = await this.auditLogService.getLogsByUser(target, 10);
        if (!logs.length)
            return ctx.reply('Audit loglar topilmadi.');
        let msg = `Oxirgi 10 audit log (${target}):\n`;
        for (const l of logs) {
            msg += `\n[${l.createdAt.toLocaleString()}] ${l.action} | By: ${l.performedBy}`;
            if (l.affectedUser)
                msg += ` | Affected: ${l.affectedUser}`;
            if (l.details)
                msg += `\n  Details: ${l.details}`;
        }
        ctx.reply(msg);
    }
    async auditLogLast(ctx) {
        const userId = ctx.from?.id ? await this.userService.getUserIdByTelegram(ctx.from.id) : null;
        if (!userId)
            return ctx.reply('Foydalanuvchi topilmadi.');
        const user = await this.userService.findOne(userId);
        const userRole = ctx.chat && user ? await this.userService.getUserRole(user.telegramId, String(ctx.chat.id)) : null;
        if (!user || !userRole || !['ADMIN', 'SUPERVISOR'].includes(String(userRole)))
            return ctx.reply('Ruxsat yo‘q.');
        const logs = await this.auditLogService.getLastLogs(10);
        if (!logs.length)
            return ctx.reply('Audit loglar topilmadi.');
        let msg = 'Oxirgi 10 audit log:\n';
        for (const l of logs) {
            msg += `\n[${l.createdAt.toLocaleString()}] ${l.action} | By: ${l.performedBy}`;
            if (l.affectedUser)
                msg += ` | Affected: ${l.affectedUser}`;
            if (l.details)
                msg += `\n  Details: ${l.details}`;
        }
        ctx.reply(msg);
    }
    async checkIn(ctx) {
        const userId = ctx.from?.id ? await this.userService.getUserIdByTelegram(ctx.from.id) : null;
        const chatId = ctx.chat?.id ? String(ctx.chat.id) : null;
        if (!userId || !chatId)
            return ctx.reply('Foydalanuvchi yoki chat aniqlanmadi.');
        const log = await this.attendanceLogService.checkIn(userId, chatId);
        if (!log)
            return ctx.reply('Siz bugun allaqachon check-in qilgansiz yoki foydalanuvchi topilmadi.');
        return ctx.reply(log.isLate ? 'Check-in qabul qilindi, ammo siz kechikdingiz.' : 'Check-in muvaffaqiyatli!');
    }
    async checkOut(ctx) {
        const userId = ctx.from?.id ? await this.userService.getUserIdByTelegram(ctx.from.id) : null;
        const chatId = ctx.chat?.id ? String(ctx.chat.id) : null;
        if (!userId || !chatId)
            return ctx.reply('Foydalanuvchi yoki chat aniqlanmadi.');
        const log = await this.attendanceLogService.checkOut(userId, chatId);
        if (!log)
            return ctx.reply('Siz hali check-in qilmagansiz yoki foydalanuvchi topilmadi.');
        return ctx.reply('Check-out qabul qilindi!');
    }
    async submitReport(ctx) {
        const args = ctx.message && 'text' in ctx.message ? ctx.message.text.split(' ') : [];
        if (!args || args.length < 2)
            return ctx.reply('Foydalanish: /submit_report <hisobot_kodi> [fayl biriktiring]');
        const reportCode = args[1];
        const telegramMessage = ctx.message;
        const submittedByTelegramId = ctx.from?.id;
        const chatId = ctx.chat?.id;
        if (!submittedByTelegramId || !chatId)
            return ctx.reply('Telegram ID yoki chat aniqlanmadi.');
        if (!telegramMessage || !telegramMessage.document)
            return ctx.reply('Hisobot faylini biriktiring (document sifatida).');
        try {
            await this.reportSubmissionService.processReport({
                reportCode,
                telegramMessage,
                submittedByTelegramId,
                chatId,
                ctx,
            });
            ctx.reply('Hisobot qabul qilindi va loglandi.');
        }
        catch (err) {
            ctx.reply('Hisobotni qabul qilishda xatolik: ' + (err && err.message ? err.message : err));
        }
    }
    async myKpi(ctx) {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const userId = ctx.from?.id ? await this.userService.getUserIdByTelegram(ctx.from.id) : null;
        if (!userId)
            return ctx.reply('Foydalanuvchi topilmadi.');
        await this.kpiCalculationService.calculateResponseTimeKpisForUser(userId, weekAgo, now);
        await this.kpiCalculationService.calculateReportSubmissionKpisForUser(userId, weekAgo, now);
        await this.kpiCalculationService.calculateAttendanceKpisForUser(userId, weekAgo, now);
        const kpiScores = await this.kpiCalculationService.getLatestKpiScoresForUser(userId, 10);
        const avgResp = kpiScores.find(k => k.kpiMetricCode === 'AVG_RESPONSE_TIME');
        const percent10 = kpiScores.find(k => k.kpiMetricCode === 'PERCENT_RESPONSE_UNDER_10MIN');
        const reportPercent = kpiScores.find(k => k.kpiMetricCode === 'REPORTS_ON_TIME_PERCENT');
        const attendancePercent = kpiScores.find(k => k.kpiMetricCode === 'ATTENDANCE_ON_TIME_PERCENT');
        const msg = `🕒 Sizning KPI:
` +
            `O'rtacha javob vaqti: ${avgResp ? avgResp.scoreValue.toFixed(1) + 's' : '-'}\n` +
            `10 daqiqada javob berilganlar: ${percent10 ? percent10.scoreValue + '%' : '-'}\n` +
            `Hisobotlar o'z vaqtida topshirilgan: ${reportPercent ? reportPercent.scoreValue + '%' : '-'}\n` +
            `08:30 dan oldin kelgan kunlar: ${attendancePercent ? attendancePercent.scoreValue + '%' : '-'}\n`;
        ctx.reply(msg);
    }
    async kpiStats(ctx) {
        const total = await this.aiAnalysisResultService.countAll();
        const approved = await this.humanFeedbackService.countByVerdict('approved');
        const rejected = await this.humanFeedbackService.countByVerdict('rejected');
        const percent = total ? Math.round((approved / total) * 100) : 0;
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        await this.kpiCalculationService.calculateAllUsersResponseTimeKpis(weekAgo, now);
        const userId = ctx.from?.id ? await this.userService.getUserIdByTelegram(ctx.from.id) : null;
        let kpiMsg = '';
        if (userId) {
            const kpiScores = await this.kpiCalculationService.getLatestKpiScoresForUser(userId, 2);
            if (kpiScores && kpiScores.length) {
                const avgResp = kpiScores.find(k => k.kpiMetricCode === 'AVG_RESPONSE_TIME');
                const percent10 = kpiScores.find(k => k.kpiMetricCode === 'PERCENT_RESPONSE_UNDER_10MIN');
                const reportPercent = kpiScores.find(k => k.kpiMetricCode === 'REPORTS_ON_TIME_PERCENT');
                const attendancePercent = kpiScores.find(k => k.kpiMetricCode === 'ATTENDANCE_ON_TIME_PERCENT');
                kpiMsg = `\n\n🕒 KPI:\nO'rtacha javob vaqti: ${avgResp ? avgResp.scoreValue.toFixed(1) + 's' : '-'}\n10 daqiqada javob berilganlar: ${percent10 ? percent10.scoreValue + '%' : '-'}\nHisobotlar o'z vaqtida topshirilgan: ${reportPercent ? reportPercent.scoreValue + '%' : '-'}\n08:30 dan oldin kelgan kunlar: ${attendancePercent ? attendancePercent.scoreValue + '%' : '-'}\n`;
            }
            ctx.reply(`KPI/SI statistikasi:\nJami natija: ${total}\nTasdiqlangan: ${approved}\nRad etilgan: ${rejected}\nTo'g'ri tahlil foizi: ${percent}%${kpiMsg}`);
        }
    }
    async adminTest(ctx) {
        ctx.reply('Siz ADMIN sifatida ushbu buyruqni ishlata oldingiz!');
    }
    async onCallbackQuery(ctx) {
        const data = ctx.callbackQuery?.data;
        if (!data)
            return;
        if (data.startsWith('feedback:')) {
            const [, resultId, action] = data.split(':');
            await this.humanFeedbackService.addFeedback({
                aiAnalysisResultId: Number(resultId),
                verdict: action === 'approve' ? 'approved' : 'rejected',
                reviewerTelegramId: ctx.from?.id?.toString(),
                createdAt: new Date(),
            });
            await ctx.reply(`Feedback qabul qilindi: ${action}`);
            await ctx.answerCbQuery('Javobingiz uchun rahmat!');
        }
    }
};
exports.TelegramUpdate = TelegramUpdate;
__decorate([
    (0, nestjs_telegraf_1.Start)(),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "onStart", null);
__decorate([
    (0, nestjs_telegraf_1.Help)(),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "onHelp", null);
__decorate([
    (0, nestjs_telegraf_1.On)('message'),
    __param(0, (0, nestjs_telegraf_1.Message)()),
    __param(1, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "onMessage", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.SUPERVISOR),
    (0, nestjs_telegraf_1.Command)('review_ai_results'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "reviewAiResults", null);
__decorate([
    (0, nestjs_telegraf_1.Command)('analyze_sentiment'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "analyzeSentiment", null);
__decorate([
    (0, nestjs_telegraf_1.Command)('get_analysis_result'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "getAnalysisResult", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, nestjs_telegraf_1.Command)('assign_role'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __param(1, (0, nestjs_telegraf_1.Message)('text')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context, String]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "assignRole", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.SUPERVISOR),
    (0, nestjs_telegraf_1.Command)('audit_log'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "auditLog", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.SUPERVISOR),
    (0, nestjs_telegraf_1.Command)('audit_log_last'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "auditLogLast", null);
__decorate([
    (0, nestjs_telegraf_1.Command)('checkin'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "checkIn", null);
__decorate([
    (0, nestjs_telegraf_1.Command)('checkout'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "checkOut", null);
__decorate([
    (0, nestjs_telegraf_1.Command)('submit_report'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "submitReport", null);
__decorate([
    (0, nestjs_telegraf_1.Command)('mykpi'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "myKpi", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.SUPERVISOR),
    (0, nestjs_telegraf_1.Command)('kpi_stats'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "kpiStats", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, nestjs_telegraf_1.Command)('admin_test'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "adminTest", null);
__decorate([
    (0, nestjs_telegraf_1.On)('callback_query'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "onCallbackQuery", null);
exports.TelegramUpdate = TelegramUpdate = __decorate([
    (0, nestjs_telegraf_1.Update)(),
    __metadata("design:paramtypes", [typeof (_a = typeof response_time_service_1.ResponseTimeService !== "undefined" && response_time_service_1.ResponseTimeService) === "function" ? _a : Object, typeof (_b = typeof user_service_1.UserService !== "undefined" && user_service_1.UserService) === "function" ? _b : Object, typeof (_c = typeof ai_queue_service_1.AiQueueService !== "undefined" && ai_queue_service_1.AiQueueService) === "function" ? _c : Object, typeof (_d = typeof ai_analysis_result_service_1.AiAnalysisResultService !== "undefined" && ai_analysis_result_service_1.AiAnalysisResultService) === "function" ? _d : Object, typeof (_e = typeof human_feedback_service_1.HumanFeedbackService !== "undefined" && human_feedback_service_1.HumanFeedbackService) === "function" ? _e : Object, Object, typeof (_f = typeof report_submission_service_1.ReportSubmissionService !== "undefined" && report_submission_service_1.ReportSubmissionService) === "function" ? _f : Object, typeof (_g = typeof attendance_log_service_1.AttendanceLogService !== "undefined" && attendance_log_service_1.AttendanceLogService) === "function" ? _g : Object, typeof (_h = typeof audit_log_service_1.AuditLogService !== "undefined" && audit_log_service_1.AuditLogService) === "function" ? _h : Object])
], TelegramUpdate);
//# sourceMappingURL=telegram.update.js.map