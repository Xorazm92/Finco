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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var TelegramBotProvider_1;
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramBotProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_service_1 = require("../user-management/user.service");
const kpi_service_1 = require("../kpi/kpi.service");
const kpi_analytics_service_1 = require("../kpi/kpi-analytics.service");
const audit_log_service_1 = require("../kpi/audit-log.service");
const message_log_service_1 = require("../message-log/message-log.service");
const report_submission_service_1 = require("../kpi-report-submission/report-submission.service");
const kpi_calculation_service_1 = require("../kpi/kpi-calculation.service");
const report_type_entity_1 = require("../kpi-report-submission/entities/report-type.entity");
const parse_kpi_message_util_1 = require("../kpi/dto/parse-kpi-message.util");
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const user_role_enum_1 = require("../../shared/enums/user-role.enum");
let TelegramBotProvider = TelegramBotProvider_1 = class TelegramBotProvider {
    configService;
    userService;
    kpiService;
    kpiAnalyticsService;
    messageLogService;
    reportSubmissionService;
    reportTypeRepo;
    kpiCalculationService;
    auditLogService;
    bot;
    logger = new common_1.Logger(TelegramBotProvider_1.name);
    constructor(configService, userService, kpiService, kpiAnalyticsService, messageLogService, reportSubmissionService, reportTypeRepo, kpiCalculationService, auditLogService) {
        this.configService = configService;
        this.userService = userService;
        this.kpiService = kpiService;
        this.kpiAnalyticsService = kpiAnalyticsService;
        this.messageLogService = messageLogService;
        this.reportSubmissionService = reportSubmissionService;
        this.reportTypeRepo = reportTypeRepo;
        this.kpiCalculationService = kpiCalculationService;
        this.auditLogService = auditLogService;
    }
    onModuleInit() {
        const token = this.configService.get('TELEGRAM_BOT_TOKEN');
        if (!token) {
            this.logger.error('TELEGRAM_BOT_TOKEN topilmadi. .env faylga qo‘shing!');
            return;
        }
        this.bot = new node_telegram_bot_api_1.default(token, { polling: true });
        this.logger.log('Telegram bot ishga tushdi');
        this.initHandlers();
        this.bot.onText(/\/approve_ai\s+(\d+)/i, async (msg, match) => {
            if (!match)
                return;
            await this.handleAiFeedbackCommand(msg, match, 'approved');
        });
        this.bot.onText(/\/reject_ai\s+(\d+)/i, async (msg, match) => {
            if (!match)
                return;
            await this.handleAiFeedbackCommand(msg, match, 'rejected');
        });
        this.bot.onText(/\/correct_ai\s+(\d+)\s+([\s\S]+)/i, async (msg, match) => {
            if (!match)
                return;
            await this.handleAiFeedbackCommand(msg, match, 'corrected');
        });
        this.bot.onText(/\/review_ai_assessment\s+(\d+)/i, async (msg, match) => {
            if (!match)
                return;
            await this.handleReviewAiAssessmentCommand(msg, match);
        });
    }
    async handleAiFeedbackCommand(msg, match, verdict) {
        const telegramId = String(msg.from?.id);
        try {
            const caller = await this.userService.findByTelegramId(telegramId);
            if (!caller) {
                await this.bot.sendMessage(msg.chat.id, 'Siz ro‘yxatdan o‘tmagansiz! Avval  yuboring.');
                return;
            }
            const callerRole = await this.userService.getUserRole(caller.telegramId, String(msg.chat.id));
            if (!callerRole || !['SUPERVISOR', 'ADMIN'].includes(String(callerRole))) {
                await this.bot.sendMessage(msg.chat.id, 'Bu buyruq faqat SUPERVISOR yoki ADMIN uchun!');
                return;
            }
            const id = match && match[1] ? Number(match[1]) : undefined;
            if (!id) {
                await this.bot.sendMessage(msg.chat.id, 'AI natija ID ni kiriting.');
                return;
            }
            let comment = undefined;
            if (verdict === 'corrected') {
                comment = match && match[2] ? match[2].trim() : undefined;
                if (!comment) {
                    await this.bot.sendMessage(msg.chat.id, 'Tuzatish yoki izoh kiritilishi shart: /correct_ai <id> <izoh>');
                    return;
                }
            }
            const res = await fetch(`${process.env.API_BASE_URL || 'http://localhost:3000'}/human-feedback/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    aiAnalysisResultId: id,
                    reviewerTelegramId: telegramId,
                    verdict,
                    comment,
                }),
            });
            if (!res.ok) {
                await this.bot.sendMessage(msg.chat.id, 'Feedback yuborishda xatolik.');
                return;
            }
            await this.bot.sendMessage(msg.chat.id, `✅ Feedback (${verdict}) qabul qilindi!`);
        }
        catch (err) {
            this.logger.error('AI Feedback error', err);
            await this.bot.sendMessage(msg.chat.id, `Xatolik: ${(err && err.message) || 'Noma’lum xato'}`);
        }
    }
    async handleReviewAiAssessmentCommand(msg, match) {
        const telegramId = String(msg.from?.id);
        try {
            const caller = await this.userService.findByTelegramId(telegramId);
            if (!caller) {
                await this.bot.sendMessage(msg.chat.id, `Siz ro'yxatdan o'tmagansiz! Avval /register yuboring.`);
                return;
            }
            const callerRole = await this.userService.getUserRole(caller.telegramId, String(msg.chat.id));
            if (!callerRole || !['SUPERVISOR', 'ADMIN'].includes(String(callerRole))) {
                await this.bot.sendMessage(msg.chat.id, 'Bu buyruq faqat SUPERVISOR yoki ADMIN uchun!');
                return;
            }
            const id = match && match[1] ? Number(match[1]) : undefined;
            if (!id) {
                await this.bot.sendMessage(msg.chat.id, 'AI natija ID ni kiriting.');
                return;
            }
            const res = await fetch(`${process.env.API_BASE_URL || 'http://localhost:3000'}/ai-analysis-result/${id}`);
            if (!res.ok) {
                await this.bot.sendMessage(msg.chat.id, 'AI natija topilmadi.');
                return;
            }
            const aiResult = await res.json();
            const resp = `AI natija #${id}:\n${aiResult.result}`;
            await this.bot.sendMessage(msg.chat.id, resp);
        }
        catch (err) {
            this.logger.error('Review AI Assessment error', err);
            await this.bot.sendMessage(msg.chat.id, `Xatolik: ${(err && err.message) || 'Nomalum xato'}`);
        }
    }
    initHandlers() {
        this.bot.onText(/\/start/, async (msg) => {
            await this.bot.sendMessage(msg.chat.id, 'Assalomu alaykum! FinCo KPI botga xush kelibsiz.');
        });
        this.bot.onText(/\/register/, async (msg) => {
            const telegramId = String(msg.from?.id);
            try {
                const existing = await this.userService.findByTelegramId(telegramId);
                if (existing) {
                    await this.bot.sendMessage(msg.chat.id, 'Siz allaqachon ro‘yxatdan o‘tgansiz!');
                    return;
                }
                const randomPassword = Math.random().toString(36).slice(-8);
                const userData = {
                    telegramId,
                    firstName: msg.from?.first_name || '',
                    lastName: msg.from?.last_name || '',
                    username: msg.from?.username || '',
                    password: randomPassword,
                    role: user_role_enum_1.UserRole.CLIENT,
                };
                await this.userService.createOrUpdate(userData);
                await this.bot.sendMessage(msg.chat.id, '✅ Ro‘yxatdan o‘tish muvaffaqiyatli yakunlandi! Endi barcha buyruqlardan foydalanishingiz mumkin.');
            }
            catch (err) {
                this.logger?.error?.('Register error', err);
                await this.bot.sendMessage(msg.chat.id, `❌ Ro‘yxatdan o‘tishda xatolik: ${(err && err.message) || 'Noma’lum xato'}`);
            }
        });
        this.bot.onText(/\/kpi( .*)?/i, async (msg) => {
            const telegramId = String(msg.from?.id);
            const text = msg.text || '';
            const { value, comment } = (0, parse_kpi_message_util_1.parseKpiMessage)(text);
            if (value === null) {
                await this.bot.sendMessage(msg.chat.id, 'KPI yuborish uchun: /kpi <qiymat> <izoh ixtiyoriy>\nMasalan: /kpi 1234 Bugungi KPI');
                return;
            }
            try {
                const user = await this.userService.findByTelegramId(telegramId);
                if (!user) {
                    await this.bot.sendMessage(msg.chat.id, 'Siz ro‘yxatdan o‘tmagansiz! Avval /register yuboring.');
                    return;
                }
                await this.kpiService.create(user.id, { value, comment });
                await this.bot.sendMessage(msg.chat.id, `KPI (${value}) muvaffaqiyatli saqlandi!${comment ? '\nIzoh: ' + comment : ''}`);
            }
            catch (err) {
                this.logger.error('KPI error', err);
                await this.bot.sendMessage(msg.chat.id, `Xatolik: ${(err && err.message) || 'Noma’lum xato'}`);
            }
        });
        this.bot.onText(/\/mykpi/, async (msg) => {
            const telegramId = String(msg.from?.id);
            try {
                const user = await this.userService.findByTelegramId(telegramId);
                if (!user) {
                    await this.bot.sendMessage(msg.chat.id, 'Siz ro‘yxatdan o‘tmagansiz! Avval /register yuboring.');
                    return;
                }
                const kpis = await this.kpiService.findByUser(user.id);
                if (!kpis.length) {
                    await this.bot.sendMessage(msg.chat.id, 'Sizda hali KPI yo‘q. KPI yuborish uchun: /kpi <qiymat> <izoh>');
                    return;
                }
                const last = kpis.slice(0, 5).map(kpi => `${kpi.createdAt.toLocaleString('uz-UZ', { hour12: false })}: ${kpi.value}${kpi.comment ? ' — ' + kpi.comment : ''}`).join('\n');
                await this.bot.sendMessage(msg.chat.id, `So‘nggi 5 KPI:\n${last}`);
            }
            catch (err) {
                this.logger.error('MyKPI error', err);
                await this.bot.sendMessage(msg.chat.id, `Xatolik: ${(err && err.message) || 'Noma’lum xato'}`);
            }
        });
        this.bot.onText(/\/kpi_stats/, async (msg) => {
            const telegramId = String(msg.from?.id);
            try {
                const user = await this.userService.findByTelegramId(telegramId);
                if (!user) {
                    await this.bot.sendMessage(msg.chat.id, 'Siz ro‘yxatdan o‘tmagansiz! Avval /register yuboring.');
                    return;
                }
                const stats = await this.kpiAnalyticsService.getUserStats(user.id);
                if (!stats) {
                    await this.bot.sendMessage(msg.chat.id, 'Sizda hali KPI statistikasi yo‘q. KPI yuborish uchun: /kpi <qiymat> <izoh>');
                    return;
                }
                const resp = `📊 KPI statistikasi (so‘nggi ${stats.count}):\n` +
                    `Haftalik o‘rtacha: ${stats.weekAvg !== null ? stats.weekAvg.toFixed(2) : '-'}\n` +
                    `Oylik o‘rtacha: ${stats.monthAvg !== null ? stats.monthAvg.toFixed(2) : '-'}\n` +
                    `Eng yuqori: ${stats.max !== null ? stats.max : '-'}\n` +
                    `Eng past: ${stats.min !== null ? stats.min : '-'}\n` +
                    `Trend: ${stats.trend || '-'}`;
                await this.bot.sendMessage(msg.chat.id, resp);
            }
            catch (err) {
                this.logger.error('KPI Stats error', err);
                await this.bot.sendMessage(msg.chat.id, `Xatolik: ${(err && err.message) || 'Noma’lum xato'}`);
            }
        });
        this.bot.onText(/\/view_kpi(?:\s+(@\w+|\d+))?(?:\s+(\d+))?/i, async (msg, match) => {
            const telegramId = String(msg.from?.id);
            try {
                const caller = await this.userService.findByTelegramId(telegramId);
                if (!caller) {
                    await this.bot.sendMessage(msg.chat.id, 'Siz ro‘yxatdan o‘tmagansiz! Avval /register yuboring.');
                    return;
                }
                const callerRole = await this.userService.getUserRole(caller.telegramId, String(msg.chat.id));
                if (!callerRole || !['SUPERVISOR', 'ADMIN'].includes(String(callerRole))) {
                    await this.bot.sendMessage(msg.chat.id, 'Bu buyruq faqat SUPERVISOR yoki ADMIN uchun!');
                    return;
                }
                const target = match && match[1] ? match[1] : null;
                const limit = match && match[2] ? parseInt(match[2], 10) : 5;
                let user = null;
                if (target) {
                    if (target.startsWith('@')) {
                        user = await this.userService.findByTelegramIdOrUsername(target.slice(1));
                    }
                    else if (/^\d+$/.test(target)) {
                        user = await this.userService.findOne(Number(target));
                    }
                }
                if (!user) {
                    await this.bot.sendMessage(msg.chat.id, 'Foydalanuvchi topilmadi. Username yoki user_id ni to‘g‘ri kiriting.');
                    return;
                }
                const kpis = await this.kpiService.findByUser(user.id);
                if (!kpis.length) {
                    await this.bot.sendMessage(msg.chat.id, `@${user.username || user.telegramId} uchun KPI topilmadi.`);
                    return;
                }
                const last = kpis.slice(0, limit).map(kpi => `#${kpi.id} | ${kpi.createdAt.toLocaleString('uz-UZ', { hour12: false })}: ${kpi.value}${kpi.comment ? ' — ' + kpi.comment : ''}`).join('\n');
                await this.bot.sendMessage(msg.chat.id, `@${user.username || user.telegramId} so‘nggi ${limit} KPI:\n${last}`);
            }
            catch (err) {
                this.logger.error('ViewKPI error', err);
                await this.bot.sendMessage(msg.chat.id, `Xatolik: ${(err && err.message) || 'Noma’lum xato'}`);
            }
        });
        this.bot.onText(/\/kpi_stats_all/, async (msg) => {
            const telegramId = String(msg.from?.id);
            try {
                const caller = await this.userService.findByTelegramId(telegramId);
                if (!caller) {
                    await this.bot.sendMessage(msg.chat.id, 'Siz ro‘yxatdan o‘tmagansiz! Avval /register yuboring.');
                    return;
                }
                const callerRole = await this.userService.getUserRole(caller.telegramId, String(msg.chat.id));
                if (!callerRole || !['SUPERVISOR', 'ADMIN'].includes(String(callerRole))) {
                    await this.bot.sendMessage(msg.chat.id, 'Bu buyruq faqat SUPERVISOR yoki ADMIN uchun!');
                    return;
                }
                const allUsers = await this.userService.findAll();
                const userStats = await Promise.all(allUsers.map(async (u) => ({
                    user: u,
                    stats: await this.kpiAnalyticsService.getUserStats(u.id)
                })));
                const statsWithData = userStats.filter(us => us.stats && us.stats.count > 0);
                if (!statsWithData.length) {
                    await this.bot.sendMessage(msg.chat.id, 'Hech bir foydalanuvchida KPI statistikasi yo‘q.');
                    return;
                }
                const allKpis = statsWithData.flatMap(us => us.stats ? Array(us.stats.count).fill(us.stats.weekAvg ?? 0) : []);
                const overallAvg = (allKpis.length ? allKpis.reduce((a, b) => a + b, 0) / allKpis.length : null);
                const top = [...statsWithData].sort((a, b) => ((b.stats?.weekAvg ?? 0) - (a.stats?.weekAvg ?? 0))).slice(0, 3);
                const bottom = [...statsWithData].sort((a, b) => ((a.stats?.weekAvg ?? 0) - (b.stats?.weekAvg ?? 0))).slice(0, 3);
                const resp = `📊 Umumiy KPI statistikasi:\n` +
                    `Umumiy haftalik o‘rtacha: ${overallAvg !== null ? overallAvg.toFixed(2) : '-'}\n` +
                    `Eng yaxshi 3: ` + top.map(t => `@${t.user.username || t.user.telegramId} (${t.stats?.weekAvg?.toFixed(2) ?? '-'})`).join(', ') + '\n' +
                    `Eng yomon 3: ` + bottom.map(t => `@${t.user.username || t.user.telegramId} (${t.stats?.weekAvg?.toFixed(2) ?? '-'})`).join(', ');
                await this.bot.sendMessage(msg.chat.id, resp);
            }
            catch (err) {
                this.logger.error('KPI Stats All error', err);
                await this.bot.sendMessage(msg.chat.id, `Xatolik: ${(err && err.message) || 'Noma’lum xato'}`);
            }
        });
        this.bot.onText(/\/kpi_stats\s+(@\w+|\d+)/i, async (msg, match) => {
            const telegramId = String(msg.from?.id);
            try {
                const caller = await this.userService.findByTelegramId(telegramId);
                if (!caller) {
                    await this.bot.sendMessage(msg.chat.id, 'Siz ro‘yxatdan o‘tmagansiz! Avval /register yuboring.');
                    return;
                }
                const callerRole = await this.userService.getUserRole(caller.telegramId, String(msg.chat.id));
                if (!callerRole || !['SUPERVISOR', 'ADMIN'].includes(String(callerRole))) {
                    await this.bot.sendMessage(msg.chat.id, 'Bu buyruq faqat SUPERVISOR yoki ADMIN uchun!');
                    return;
                }
                const target = match && match[1] ? match[1] : null;
                let user = null;
                if (target) {
                    if (target.startsWith('@')) {
                        user = await this.userService.findByTelegramIdOrUsername(target.slice(1));
                    }
                    else if (/^\d+$/.test(target)) {
                        user = await this.userService.findOne(Number(target));
                    }
                }
                if (!user) {
                    await this.bot.sendMessage(msg.chat.id, 'Foydalanuvchi topilmadi. Username yoki user_id ni to‘g‘ri kiriting.');
                    return;
                }
                const stats = await this.kpiAnalyticsService.getUserStats(user.id);
                if (!stats) {
                    await this.bot.sendMessage(msg.chat.id, `@${user.username || user.telegramId} uchun KPI statistikasi yo‘q.`);
                    return;
                }
                const resp = `📊 @${user.username || user.telegramId} KPI statistikasi (so‘nggi ${stats.count}):\n` +
                    `Haftalik o‘rtacha: ${stats.weekAvg !== null ? stats.weekAvg.toFixed(2) : '-'}\n` +
                    `Oylik o‘rtacha: ${stats.monthAvg !== null ? stats.monthAvg.toFixed(2) : '-'}\n` +
                    `Eng yuqori: ${stats.max !== null ? stats.max : '-'}\n` +
                    `Eng past: ${stats.min !== null ? stats.min : '-'}\n` +
                    `Trend: ${stats.trend || '-'}`;
                await this.bot.sendMessage(msg.chat.id, resp);
            }
            catch (err) {
                this.logger.error('KPI Stats user error', err);
                await this.bot.sendMessage(msg.chat.id, `Xatolik: ${(err && err.message) || 'Noma’lum xato'}`);
            }
        });
        this.bot.onText(/\/top_kpi(?:\s+(\d+))?/i, async (msg, match) => {
            const telegramId = String(msg.from?.id);
            try {
                const caller = await this.userService.findByTelegramId(telegramId);
                if (!caller) {
                    await this.bot.sendMessage(msg.chat.id, 'Siz ro‘yxatdan o‘tmagansiz! Avval /register yuboring.');
                    return;
                }
                const callerRole = await this.userService.getUserRole(caller.telegramId, String(msg.chat.id));
                if (!callerRole || !['SUPERVISOR', 'ADMIN'].includes(String(callerRole))) {
                    await this.bot.sendMessage(msg.chat.id, 'Bu buyruq faqat SUPERVISOR yoki ADMIN uchun!');
                    return;
                }
                const n = match && match[1] ? parseInt(match[1], 10) : 3;
                const allUsers = await this.userService.findAll();
                const userStats = await Promise.all(allUsers.map(async (u) => ({
                    user: u,
                    stats: await this.kpiAnalyticsService.getUserStats(u.id)
                })));
                const statsWithData = userStats.filter(us => us.stats && us.stats.count > 0);
                if (!statsWithData.length) {
                    await this.bot.sendMessage(msg.chat.id, 'Hech bir foydalanuvchida KPI statistikasi yo‘q.');
                    return;
                }
                const top = [...statsWithData].sort((a, b) => ((b.stats?.weekAvg ?? 0) - (a.stats?.weekAvg ?? 0))).slice(0, n);
                const resp = `🏆 Eng yaxshi ${n} foydalanuvchi (haftalik o‘rtacha KPI):\n` +
                    top.map((t, i) => `${i + 1}. @${t.user.username || t.user.telegramId} — ${t.stats?.weekAvg?.toFixed(2) ?? '-'}`).join('\n');
                await this.bot.sendMessage(msg.chat.id, resp);
            }
            catch (err) {
                this.logger.error('TopKPI error', err);
                await this.bot.sendMessage(msg.chat.id, `Xatolik: ${(err && err.message) || 'Noma’lum xato'}`);
            }
        });
        this.bot.onText(/\/bottom_kpi(?:\s+(\d+))?/i, async (msg, match) => {
            const telegramId = String(msg.from?.id);
            try {
                const caller = await this.userService.findByTelegramId(telegramId);
                if (!caller) {
                    await this.bot.sendMessage(msg.chat.id, 'Siz ro‘yxatdan o‘tmagansiz! Avval /register yuboring.');
                    return;
                }
                const callerRole = await this.userService.getUserRole(caller.telegramId, String(msg.chat.id));
                if (!callerRole || !['SUPERVISOR', 'ADMIN'].includes(String(callerRole))) {
                    await this.bot.sendMessage(msg.chat.id, 'Bu buyruq faqat SUPERVISOR yoki ADMIN uchun!');
                    return;
                }
                const n = match && match[1] ? parseInt(match[1], 10) : 3;
                const allUsers = await this.userService.findAll();
                const userStats = await Promise.all(allUsers.map(async (u) => ({
                    user: u,
                    stats: await this.kpiAnalyticsService.getUserStats(u.id)
                })));
                const statsWithData = userStats.filter(us => us.stats && us.stats.count > 0);
                if (!statsWithData.length) {
                    await this.bot.sendMessage(msg.chat.id, 'Hech bir foydalanuvchida KPI statistikasi yo‘q.');
                    return;
                }
                const bottom = [...statsWithData].sort((a, b) => ((a.stats?.weekAvg ?? 0) - (b.stats?.weekAvg ?? 0))).slice(0, n);
                const resp = `🔻 Eng past ${n} foydalanuvchi (haftalik o‘rtacha KPI):\n` +
                    bottom.map((t, i) => `${i + 1}. @${t.user.username || t.user.telegramId} — ${t.stats?.weekAvg?.toFixed(2) ?? '-'}`).join('\n');
                await this.bot.sendMessage(msg.chat.id, resp);
            }
            catch (err) {
                this.logger.error('BottomKPI error', err);
                await this.bot.sendMessage(msg.chat.id, `Xatolik: ${(err && err.message) || 'Noma’lum xato'}`);
            }
        });
        this.bot.onText(/\/edit_kpi\s+(\d+)\s+([\d,.]+)(?:\s+([^\n]+?))?(?:\s+\[(.+)\])?$/i, async (msg, match) => {
            const telegramId = String(msg.from?.id);
            try {
                const caller = await this.userService.findByTelegramId(telegramId);
                if (!caller) {
                    await this.bot.sendMessage(msg.chat.id, 'Siz ro‘yxatdan o‘tmagansiz! Avval /register yuboring.');
                    return;
                }
                const callerRole = await this.userService.getUserRole(caller.telegramId, String(msg.chat.id));
                if (!callerRole || !['SUPERVISOR', 'ADMIN'].includes(String(callerRole))) {
                    await this.bot.sendMessage(msg.chat.id, 'Bu buyruq faqat SUPERVISOR yoki ADMIN uchun!');
                    return;
                }
                if (!match)
                    return;
                const kpiId = Number(match[1]);
                const value = parseFloat(match[2].replace(',', '.'));
                const comment = match && match[3] ? match[3].trim() : undefined;
                const reason = match && match[4] ? match[4].trim() : undefined;
                const kpi = await this.kpiService.findById(kpiId);
                if (!kpi) {
                    await this.bot.sendMessage(msg.chat.id, `KPI topilmadi (id=${kpiId}).`);
                    return;
                }
                const oldValue = kpi.value;
                const oldComment = kpi.comment;
                const updated = await this.kpiService.updateKpi(kpiId, value, comment);
                await this.auditLogService.logEdit({
                    kpiId,
                    performedBy: caller.id,
                    oldValue,
                    oldComment: oldComment ?? '',
                    newValue: value,
                    newComment: comment ?? '',
                    reason,
                });
                await this.bot.sendMessage(msg.chat.id, `KPI #${kpiId} muvaffaqiyatli tahrirlandi.`);
            }
            catch (err) {
                this.logger.error('EditKPI error', err);
                await this.bot.sendMessage(msg.chat.id, `Xatolik: ${(err && err.message) || 'Noma’lum xato'}`);
            }
        });
        this.bot.onText(/\/delete_kpi\s+(\d+)(?:\s+\[(.+)\])?$/i, async (msg, match) => {
            const telegramId = String(msg.from?.id);
            try {
                const caller = await this.userService.findByTelegramId(telegramId);
                if (!caller) {
                    await this.bot.sendMessage(msg.chat.id, 'Siz ro‘yxatdan o‘tmagansiz! Avval /register yuboring.');
                    return;
                }
                const callerRole = await this.userService.getUserRole(caller.telegramId, String(msg.chat.id));
                if (!callerRole || !['SUPERVISOR', 'ADMIN'].includes(String(callerRole))) {
                    await this.bot.sendMessage(msg.chat.id, 'Bu buyruq faqat SUPERVISOR yoki ADMIN uchun!');
                    return;
                }
                if (!match)
                    return;
                const kpiId = Number(match[1]);
                const reason = match[2]?.trim();
                const kpi = await this.kpiService.findById(kpiId);
                if (!kpi) {
                    await this.bot.sendMessage(msg.chat.id, `KPI topilmadi (id=${kpiId}).`);
                    return;
                }
                await this.kpiService.deleteKpi(kpiId);
                await this.auditLogService.logDelete({
                    kpiId,
                    performedBy: caller.id,
                    oldValue: kpi.value,
                    oldComment: kpi.comment ?? '',
                    reason,
                });
                await this.bot.sendMessage(msg.chat.id, `KPI #${kpiId} muvaffaqiyatli o‘chirildi.`);
            }
            catch (err) {
                this.logger.error('DeleteKPI error', err);
                await this.bot.sendMessage(msg.chat.id, `Xatolik: ${(err && err.message) || 'Noma’lum xato'}`);
            }
        });
        this.bot.onText(/\/audit_log\s+(\d+)/i, async (msg, match) => {
            const telegramId = String(msg.from?.id);
            try {
                const caller = await this.userService.findByTelegramId(telegramId);
                if (!caller) {
                    await this.bot.sendMessage(msg.chat.id, 'Siz ro‘yxatdan o‘tmagansiz! Avval /register yuboring.');
                    return;
                }
                const callerRole = await this.userService.getUserRole(caller.telegramId, String(msg.chat.id));
                if (!callerRole || !['SUPERVISOR', 'ADMIN'].includes(String(callerRole))) {
                    await this.bot.sendMessage(msg.chat.id, 'Bu buyruq faqat SUPERVISOR yoki ADMIN uchun!');
                    return;
                }
                if (!match)
                    return;
                const kpiId = Number(match[1]);
                const logs = await this.auditLogService.findByKpiId(kpiId);
                if (!logs.length) {
                    await this.bot.sendMessage(msg.chat.id, `KPI #${kpiId} uchun audit log topilmadi.`);
                    return;
                }
                const resp = logs.map(log => `[${log.createdAt.toLocaleString('uz-UZ', { hour12: false })}] ${log.action.toUpperCase()} by user #${log.performedBy}\n` +
                    `Old: ${log.oldValue} ${log.oldComment || ''}\n` +
                    (log.action === 'edit' ? `New: ${log.newValue} ${log.newComment || ''}\n` : '') +
                    (log.reason ? `Sabab: ${log.reason}` : '')).join('\n---\n');
                await this.bot.sendMessage(msg.chat.id, resp);
            }
            catch (err) {
                this.logger.error('AuditLog error', err);
                await this.bot.sendMessage(msg.chat.id, `Xatolik: ${(err && err.message) || 'Noma’lum xato'}`);
            }
        });
        this.bot.onText(/\/audit_log_last(?:\s+(\d+))?/i, async (msg, match) => {
            const telegramId = String(msg.from?.id);
            try {
                const caller = await this.userService.findByTelegramId(telegramId);
                if (!caller) {
                    await this.bot.sendMessage(msg.chat.id, 'Siz ro‘yxatdan o‘tmagansiz! Avval /register yuboring.');
                    return;
                }
                const callerRole = await this.userService.getUserRole(caller.telegramId, String(msg.chat.id));
                if (!callerRole || !['SUPERVISOR', 'ADMIN'].includes(String(callerRole))) {
                    await this.bot.sendMessage(msg.chat.id, 'Bu buyruq faqat SUPERVISOR yoki ADMIN uchun!');
                    return;
                }
                const n = match && match[1] ? parseInt(match[1], 10) : 10;
                const logs = await this.auditLogService.findLast(n);
                if (!logs.length) {
                    await this.bot.sendMessage(msg.chat.id, 'Audit loglar topilmadi.');
                    return;
                }
                const resp = logs.map(log => `#${log.kpiId} [${log.createdAt.toLocaleString('uz-UZ', { hour12: false })}] ${log.action.toUpperCase()} by user #${log.performedBy}\n` +
                    `Old: ${log.oldValue} ${log.oldComment || ''}\n` +
                    (log.action === 'edit' ? `New: ${log.newValue} ${log.newComment || ''}\n` : '') +
                    (log.reason ? `Sabab: ${log.reason}` : '')).join('\n---\n');
                await this.bot.sendMessage(msg.chat.id, resp);
            }
            catch (err) {
                this.logger.error('AuditLogLast error', err);
                await this.bot.sendMessage(msg.chat.id, `Xatolik: ${(err && err.message) || 'Noma’lum xato'}`);
            }
        });
        this.bot.onText(/\/review_ai_assessment\s+(\d+)/i, async (msg, match) => {
            const telegramId = String(msg.from?.id);
            try {
                const caller = await this.userService.findByTelegramId(telegramId);
                if (!caller) {
                    await this.bot.sendMessage(msg.chat.id, 'Siz ro‘yxatdan o‘tmagansiz! Avval /register yuboring.');
                    return;
                }
                const callerRole = await this.userService.getUserRole(caller.telegramId, String(msg.chat.id));
                if (!callerRole || !['SUPERVISOR', 'ADMIN'].includes(String(callerRole))) {
                    await this.bot.sendMessage(msg.chat.id, 'Bu buyruq faqat SUPERVISOR yoki ADMIN uchun!');
                    return;
                }
                const id = match && match[1] ? Number(match[1]) : undefined;
                if (!id) {
                    await this.bot.sendMessage(msg.chat.id, 'AI natija ID ni kiriting: /review_ai_assessment <id>');
                    return;
                }
                const res = await fetch(`${process.env.API_BASE_URL || 'http://localhost:3000'}/ai-analysis-result/${id}`);
                if (!res.ok) {
                    await this.bot.sendMessage(msg.chat.id, `Natija topilmadi (id=${id}).`);
                    return;
                }
                const aiResult = await res.json();
                let msgText = `AI Natija #${id}\n`;
                msgText += `\n📝 Matn: ${aiResult.inputText}`;
                msgText += `\n\nNatija: ${JSON.stringify(aiResult.result, null, 2)}`;
                msgText += `\n\nJavob variantlari:\n✅ /approve_ai ${id} - Tasdiqlash\n❌ /reject_ai ${id} - Rad etish\n✏️ /correct_ai ${id} <izoh> - Tuzatish yoki izoh berish`;
                await this.bot.sendMessage(msg.chat.id, msgText);
            }
            catch (err) {
                this.logger.error('ReviewAI error', err);
                await this.bot.sendMessage(msg.chat.id, `Xatolik: ${(err && err.message) || 'Noma’lum xato'}`);
            }
        });
        this.bot.on('message', async (msg) => {
            if (!msg.chat || (msg.chat.type !== 'group' && msg.chat.type !== 'supergroup'))
                return;
            try {
                const user = await this.userService.findByTelegramId(String(msg.from?.id));
                const senderRole = (user ? await this.userService.getUserRole(user.telegramId, String(msg.chat.id)) : 'UNKNOWN') || 'UNKNOWN';
                await this.messageLogService.logMessage({
                    telegramMessageId: msg.message_id,
                    telegramChatId: msg.chat.id,
                    senderTelegramId: String(msg.from?.id),
                    senderRoleAtMoment: (user ? await this.userService.getUserRole(user.telegramId, String(msg.chat.id)) : 'UNKNOWN') || 'UNKNOWN',
                    sentAt: new Date(msg.date * 1000),
                    textContent: msg.text,
                    isReplyToMessageId: msg.reply_to_message?.message_id,
                    hasAttachments: !!(msg.document || msg.photo || msg.voice),
                    attachmentType: msg.document ? 'file' : msg.photo ? 'photo' : msg.voice ? 'voice' : undefined,
                });
            }
            catch (err) {
                this.logger?.error?.('MessageLog error', err);
            }
        });
    }
};
exports.TelegramBotProvider = TelegramBotProvider;
exports.TelegramBotProvider = TelegramBotProvider = TelegramBotProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(6, (0, typeorm_1.InjectRepository)(report_type_entity_1.ReportTypeEntity)),
    __metadata("design:paramtypes", [config_1.ConfigService, typeof (_a = typeof user_service_1.UserService !== "undefined" && user_service_1.UserService) === "function" ? _a : Object, typeof (_b = typeof kpi_service_1.KpiService !== "undefined" && kpi_service_1.KpiService) === "function" ? _b : Object, typeof (_c = typeof kpi_analytics_service_1.KpiAnalyticsService !== "undefined" && kpi_analytics_service_1.KpiAnalyticsService) === "function" ? _c : Object, typeof (_d = typeof message_log_service_1.MessageLogService !== "undefined" && message_log_service_1.MessageLogService) === "function" ? _d : Object, typeof (_e = typeof report_submission_service_1.ReportSubmissionService !== "undefined" && report_submission_service_1.ReportSubmissionService) === "function" ? _e : Object, typeorm_2.Repository, typeof (_f = typeof kpi_calculation_service_1.KpiCalculationService !== "undefined" && kpi_calculation_service_1.KpiCalculationService) === "function" ? _f : Object, typeof (_g = typeof audit_log_service_1.AuditLogService !== "undefined" && audit_log_service_1.AuditLogService) === "function" ? _g : Object])
], TelegramBotProvider);
//# sourceMappingURL=telegram.provider.js.map