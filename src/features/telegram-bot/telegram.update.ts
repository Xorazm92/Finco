import {
  Update,
  Start,
  Help,
  Ctx,
  Message,
  Command,
  On,
} from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { UseGuards } from '@nestjs/common';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { UserRole } from '../../shared/enums/user-role.enum';
import { ResponseTimeService } from '../kpi-response-time/response-time.service';
import { UserService } from '../user-management/user.service';
import { AiQueueService } from '../artificial-intelligence/ai-queue.service';

import { AiAnalysisResultService } from '../artificial-intelligence/ai-analysis-result.service';
import { HumanFeedbackService } from '../artificial-intelligence/human-feedback.service';
import { Markup } from 'telegraf';
import { ReportSubmissionService } from '../kpi-report-submission/report-submission.service';
import { AttendanceLogService } from '../attendance-log/attendance-log.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Update()
export class TelegramUpdate {
  constructor(
    private readonly responseTimeService: ResponseTimeService,
    private readonly userService: UserService,
    private readonly aiQueueService: AiQueueService,
    private readonly aiAnalysisResultService: AiAnalysisResultService,
    private readonly humanFeedbackService: HumanFeedbackService,
    private readonly kpiCalculationService: import('../kpi-calculation/kpi-calculation.service').KpiCalculationService,
    private readonly reportSubmissionService: ReportSubmissionService,
    private readonly attendanceLogService: AttendanceLogService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    await ctx.reply(
      "FinCo KPI botiga xush kelibsiz! /help buyrug'i bilan yordam olishingiz mumkin.",
    );
  }

  @Help()
  async onHelp(@Ctx() ctx: Context) {
    await ctx.reply(
      'Bot yordamchisi: \n/start - Botni boshlash\n/help - Yordam\nSavollar uchun xabar yuboring.',
    );
  }

  @On('message')
  async onMessage(@Message() message: any, @Ctx() ctx: Context) {
    // Har bir xabarni loglash va KPI uchun ishlov berish
    await this.responseTimeService.processMessage(message, ctx);

    // Avtomatik SI tahlil: reply bo'lgan va matni bor xabarlar
    if (message.reply_to_message && message.text) {
      const job = await this.aiQueueService.addSentimentJob(message.text);
      // (Optional) Job IDni loglash yoki admin kanaliga yuborish mumkin
    }
  }

  // SUPERVISOR uchun: /review_ai_results [limit]
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERVISOR)
  @Command('review_ai_results')
  async reviewAiResults(@Ctx() ctx: Context) {
    const args = ctx.message && 'text' in ctx.message ? (ctx.message as any).text.split(' ') : [];
    const limit = args.length > 1 ? parseInt(args[1]) || 5 : 5;
    // AiAnalysisResultService orqali oxirgi SI natijalarini olish
    const results = await this.aiAnalysisResultService.findLatest(undefined, limit);
    if (!results.length) return ctx.reply('SI natijalari topilmadi.');
    for (const r of results) {
      const text = `ID: ${r.id}, Natija: ${JSON.stringify(r.result).slice(0, 80)}`;
      await ctx.reply(text, Markup.inlineKeyboard([
        [
          Markup.button.callback('✅ Tasdiqlash', `feedback:${r.id}:approve`),
          Markup.button.callback('❌ Rad etish', `feedback:${r.id}:reject`)
        ]
      ]));
    }

  }

  // SI uchun: /analyze_sentiment <matn>
  @Command('analyze_sentiment')
  async analyzeSentiment(@Ctx() ctx: Context) {
    const text = ctx.message && 'text' in ctx.message ? (ctx.message as any).text.replace('/analyze_sentiment', '').trim() : '';
    if (!text) return ctx.reply('Matn kiriting: /analyze_sentiment <matn>');
    const job = await this.aiQueueService.addSentimentJob(text);
    ctx.reply(`Sizning so'rovingiz (ID: ${job.id}) navbatga qo'yildi. Natijani /get_analysis_result ${job.id} orqali tekshirishingiz mumkin.`);
  }

  // SI uchun: /get_analysis_result <job_id>
  @Command('get_analysis_result')
  async getAnalysisResult(@Ctx() ctx: Context) {
    const args = ctx.message && 'text' in ctx.message ? (ctx.message as any).text.split(' ') : [];
    if (!args || args.length < 2) return ctx.reply('Job ID kiriting: /get_analysis_result <job_id>');
    const jobId = args[1];
    const result = await this.aiQueueService.getJobResult(jobId);
    if (result.error) return ctx.reply('Natija topilmadi.');
    if (result.state !== 'completed') return ctx.reply(`Holat: ${result.state}. Natija tayyor emas.`);
    ctx.reply(`Natija: ${JSON.stringify(result.result)}`);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Command('assign_role')
  async assignRole(@Ctx() ctx: Context, @Message('text') text: string) {
    // /assign_role @username ROLE yoki /assign_role <telegram_id> ROLE
    const [_, target, role] = text.split(' ');
    let user;
    if (target.startsWith('@')) {
      user = await this.userService.findByTelegramIdOrUsername(target.replace('@', ''));
    } else {
      user = await this.userService.findByTelegramIdOrUsername(target);
    }
    if (!user) return ctx.reply('Foydalanuvchi topilmadi');
    if (!ctx.chat || !ctx.from) return;
    const chatId = String(ctx.chat.id);
    // Eski rolni aniqlash
    const oldRole = await this.userService.getUserRoleInChat(user.id, chatId);
    await this.userService.assignRoleToUserInChat(user.id, chatId, role as UserRole, String(ctx.from.id));
    // Audit log yozish
    await this.auditLogService.logAction(
      'ROLE_CHANGED',
      String(ctx.from?.id),
      String(user.id),
      {
        oldRole: oldRole ?? '-',
        newRole: role,
        chatId,
        reason: 'Role assignment via bot',
      }
    );
    ctx.reply(`${target} uchun rol: ${role} tayinlandi`);
  }

  // Audit log: KPI yoki user uchun loglarni ko'rsatish
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @Command('audit_log')
  async auditLog(@Ctx() ctx: Context) {
    // /audit_log <user_id|username>
    const args = ctx.message && 'text' in ctx.message ? (ctx.message as any).text.split(' ') : [];
    if (args.length < 2) return ctx.reply('Foydalanuvchini kiriting: /audit_log <user_id|username>');
    const target = args[1];
    // Try by user id or username
    let logs = await this.auditLogService.getLogsByUser(target, 10);
    if (!logs.length) return ctx.reply('Audit loglar topilmadi.');
    let msg = `Oxirgi 10 audit log (${target}):\n`;
    for (const l of logs) {
      msg += `\n[${l.createdAt.toLocaleString()}] ${l.action} | By: ${l.performedBy}`;
      if (l.affectedUser) msg += ` | Affected: ${l.affectedUser}`;
      if (l.details) msg += `\n  Details: ${l.details}`;
    }
    ctx.reply(msg);
  }

  // Audit log: so‘nggi N ta logni ko‘rsatish
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @Command('audit_log_last')
  async auditLogLast(@Ctx() ctx: Context) {
    // Only ADMIN/SUPERVISOR
    const userId = ctx.from?.id ? await this.userService.getUserIdByTelegram(ctx.from.id) : null;
    if (!userId) return ctx.reply('Foydalanuvchi topilmadi.');
    const user = await this.userService.findOne(userId);
    const userRole = ctx.chat && user ? await this.userService.getUserRole(user.telegramId, String(ctx.chat.id)) : null;
    if (!user || !userRole || !['ADMIN', 'SUPERVISOR'].includes(String(userRole))) return ctx.reply('Ruxsat yo‘q.');
    const logs = await this.auditLogService.getLastLogs(10);
    if (!logs.length) return ctx.reply('Audit loglar topilmadi.');
    let msg = 'Oxirgi 10 audit log:\n';
    for (const l of logs) {
      msg += `\n[${l.createdAt.toLocaleString()}] ${l.action} | By: ${l.performedBy}`;
      if (l.affectedUser) msg += ` | Affected: ${l.affectedUser}`;
      if (l.details) msg += `\n  Details: ${l.details}`;
    }
    ctx.reply(msg);
  }

  // Ishga kelish: /checkin
  @Command('checkin')
  async checkIn(@Ctx() ctx: Context) {
    const userId = ctx.from?.id ? await this.userService.getUserIdByTelegram(ctx.from.id) : null;
    const chatId = ctx.chat?.id ? String(ctx.chat.id) : null;
    if (!userId || !chatId) return ctx.reply('Foydalanuvchi yoki chat aniqlanmadi.');
    const log = await this.attendanceLogService.checkIn(userId, chatId);
    if (!log) return ctx.reply('Siz bugun allaqachon check-in qilgansiz yoki foydalanuvchi topilmadi.');
    return ctx.reply(log.isLate ? 'Check-in qabul qilindi, ammo siz kechikdingiz.' : 'Check-in muvaffaqiyatli!');
  }

  // Ishdan chiqish: /checkout
  @Command('checkout')
  async checkOut(@Ctx() ctx: Context) {
    const userId = ctx.from?.id ? await this.userService.getUserIdByTelegram(ctx.from.id) : null;
    const chatId = ctx.chat?.id ? String(ctx.chat.id) : null;
    if (!userId || !chatId) return ctx.reply('Foydalanuvchi yoki chat aniqlanmadi.');
    const log = await this.attendanceLogService.checkOut(userId, chatId);
    if (!log) return ctx.reply('Siz hali check-in qilmagansiz yoki foydalanuvchi topilmadi.');
    return ctx.reply('Check-out qabul qilindi!');
  }

  // Hisobot topshirish: /submit_report <hisobot_kodi> [fayl]
  @Command('submit_report')
  async submitReport(@Ctx() ctx: Context) {
    // Komanda: /submit_report <hisobot_kodi> (fayl biriktirilgan bo'lishi mumkin)
    const args = ctx.message && 'text' in ctx.message ? (ctx.message as any).text.split(' ') : [];
    if (!args || args.length < 2) return ctx.reply('Foydalanish: /submit_report <hisobot_kodi> [fayl biriktiring]');
    const reportCode = args[1];
    const telegramMessage = ctx.message;
    const submittedByTelegramId = ctx.from?.id;
    const chatId = ctx.chat?.id;
    if (!submittedByTelegramId || !chatId) return ctx.reply('Telegram ID yoki chat aniqlanmadi.');
    if (!telegramMessage || !(telegramMessage as any).document) return ctx.reply('Hisobot faylini biriktiring (document sifatida).');
    try {
      await this.reportSubmissionService.processReport({
        reportCode,
        telegramMessage,
        submittedByTelegramId,
        chatId,
        ctx,
      });
      ctx.reply('Hisobot qabul qilindi va loglandi.');
    } catch (err) {
      ctx.reply('Hisobotni qabul qilishda xatolik: ' + (err && err.message ? err.message : err));
    }
  }

  // Har bir foydalanuvchi uchun: /mykpi
  @Command('mykpi')
  async myKpi(@Ctx() ctx: Context) {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const userId = ctx.from?.id ? await this.userService.getUserIdByTelegram(ctx.from.id) : null;
    if (!userId) return ctx.reply('Foydalanuvchi topilmadi.');
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

  // KPI statistikasi: ADMIN va SUPERVISOR uchun
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @Command('kpi_stats')
  async kpiStats(@Ctx() ctx: Context) {
    const total = await this.aiAnalysisResultService.countAll();
    const approved = await this.humanFeedbackService.countByVerdict('approved');
    const rejected = await this.humanFeedbackService.countByVerdict('rejected');
    const percent = total ? Math.round((approved / total) * 100) : 0;

    // KPI javob vaqti statistikasi (so'nggi 7 kun uchun)
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    // ADMIN/SUPERVISOR uchun umumiy KPI (barcha xodimlar bo'yicha)
    await this.kpiCalculationService.calculateAllUsersResponseTimeKpis(weekAgo, now);
    // O'zingiz uchun (agar xohlasangiz) yoki barcha KPI'larni yig'ib chiqaring
    // Misol uchun, faqat o'zingiz uchun ko'rsatamiz:
    const userId = ctx.from?.id ? await this.userService.getUserIdByTelegram(ctx.from.id) : null;
    let kpiMsg = '';
    if (userId) {
      // Faqat so'nggi KPI'larni chiqaramiz
      const kpiScores = await this.kpiCalculationService.getLatestKpiScoresForUser(userId, 2);
      if (kpiScores && kpiScores.length) {
        const avgResp = kpiScores.find(k => k.kpiMetricCode === 'AVG_RESPONSE_TIME');
        const percent10 = kpiScores.find(k => k.kpiMetricCode === 'PERCENT_RESPONSE_UNDER_10MIN');
        const reportPercent = kpiScores.find(k => k.kpiMetricCode === 'REPORTS_ON_TIME_PERCENT');
        const attendancePercent = kpiScores.find(k => k.kpiMetricCode === 'ATTENDANCE_ON_TIME_PERCENT');
        kpiMsg = `\n\n🕒 KPI:\nO'rtacha javob vaqti: ${avgResp ? avgResp.scoreValue.toFixed(1) + 's' : '-'}\n10 daqiqada javob berilganlar: ${percent10 ? percent10.scoreValue + '%' : '-'}\nHisobotlar o'z vaqtida topshirilgan: ${reportPercent ? reportPercent.scoreValue + '%' : '-'}\n08:30 dan oldin kelgan kunlar: ${attendancePercent ? attendancePercent.scoreValue + '%' : '-'}\n`;
      }
      ctx.reply(
        `KPI/SI statistikasi:\nJami natija: ${total}\nTasdiqlangan: ${approved}\nRad etilgan: ${rejected}\nTo'g'ri tahlil foizi: ${percent}%${kpiMsg}`
      );
    }
  }



  // Test RBAC: faqat ADMIN uchun ochiq buyruq
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Command('admin_test')
  async adminTest(@Ctx() ctx: Context) {
    ctx.reply('Siz ADMIN sifatida ushbu buyruqni ishlata oldingiz!');
  }

  // Inline tugma callback handler: feedback uchun
  @On('callback_query')
  async onCallbackQuery(@Ctx() ctx: Context) {
    const data = (ctx.callbackQuery as any)?.data;
    if (!data) return;
    // Format: feedback:<resultId>:<action>
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
}
