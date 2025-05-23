import { Update, Start, Help, Ctx, On, Command } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { UserService } from '../../features/user-management/user.service';
import { MessageLoggingService } from '../message-logging/message-logging.service';
import { ResponseTimeTrackingService } from '../response-time-tracking/response-time-tracking.service';
import { HumanFeedbackService } from '../ai/human-feedback.service';
import { AiAnalysisService } from '../../features/artificial-intelligence/ai-analysis.service';
import { UseGuards, Logger } from '@nestjs/common';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { UserRole } from '../../shared/enums/user-role.enum';

interface OperatorStat {
  operatorId: string;
  responseTime: number;
}

interface OperatorStats {
  count: number;
  totalTime: number;
}

interface TelegramMessage {
  text?: string;
}

interface MessageLog {
  senderRoleAtMoment?: string;
  textContent?: string;
  isQuestion?: boolean;
  isReplyToMessageId?: number;
  sentAt: Date;
}

interface FeedbackStats {
  feedback: string;
  count: number;
}

interface DetailedFeedbackStats extends FeedbackStats {
  supervisorId: string;
  resultType: string;
}

interface ErrorWithMessage {
  message: string;
}

@Update()
export class TelegramUpdate {
  private readonly logger = new Logger(TelegramUpdate.name);

  constructor(
    private readonly userService: UserService,
    private readonly messageLoggingService: MessageLoggingService,
    private readonly responseTimeTrackingService: ResponseTimeTrackingService,
    private readonly humanFeedbackService: HumanFeedbackService,
    private readonly aiAnalysisService: AiAnalysisService,
    
  ) {}

  @Command('kpi')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async onKpi(@Ctx() ctx: Context): Promise<void> {
    const chatId = String(ctx.chat?.id);

    const avg = await this.messageLoggingService.getAverageResponseTime(chatId);

    const unanswered = await this.messageLoggingService.getUnansweredQuestionsCount(chatId);

    const stats = await this.messageLoggingService.getOperatorResponseStats(chatId);

    let msg = '📊 KPI statistikasi:\n';
    
    msg += `- O'rtacha javob vaqti: ${avg ? avg.toFixed(1) : 'Nomalum'} sekund\n`;
    msg += `- Javobsiz savollar: ${unanswered}\n`;

    if (stats.length > 0) {
      msg += '- Operatorlar boyicha javoblar:\n';
      stats.forEach((s: OperatorStat) => {
        msg += `  • Operator: ${s.operatorId} | Javob vaqti: ${
          s.responseTime ? s.responseTime.toFixed(1) : '-'
        }s\n`;
      });
    }

    await ctx.reply(msg);
  }

  @Command('pending_questions')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async onPendingQuestions(@Ctx() ctx: Context): Promise<void> {
    const chatId = String(ctx.chat?.id);

    const pending = await this.messageLoggingService['messageLogRepo'].find({
      where: {
        telegramChatId: chatId,
        isQuestion: true,
        questionStatus: 'PENDING',
      },
      order: { sentAt: 'DESC' },
      take: 10,
    });

    if (!pending.length) {
      await ctx.reply("Javobsiz savollar yo'q.");
      return;
    }

    let msg = "🕒 Javobsiz savollar (so'nggi 10ta):\n";

    pending.forEach((q: MessageLog) => {
      msg += `• [${q.sentAt.toLocaleString()}] ${q.textContent}\n`;
    });

    await ctx.reply(msg);
  }

  @Command('top_operators')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async onTopOperators(@Ctx() ctx: Context): Promise<void> {
    const chatId = String(ctx.chat?.id);

    const stats = await this.messageLoggingService.getOperatorResponseStats(chatId);

    if (!stats.length) {
      await ctx.reply('Operatorlar javob bermagan.');
      return;
    }

    const operatorMap: Record<string, OperatorStats> = {};

    stats.forEach((s: OperatorStat) => {
      if (!s.operatorId) {
        return;
      }

      if (!operatorMap[s.operatorId]) {
        operatorMap[s.operatorId] = { count: 0, totalTime: 0 };
      }

      operatorMap[s.operatorId].count += 1;
      operatorMap[s.operatorId].totalTime += s.responseTime || 0;
    });

    const sorted = Object.entries(operatorMap)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10);

    let msg = "🏆 Eng faol operatorlar (savollar soni | o'rtacha javob vaqti):\n";

    sorted.forEach(([id, data], i) => {
      const avg = data.count ? (data.totalTime / data.count).toFixed(1) : '-';
      msg += `${i + 1}. ${id} | ${data.count} ta | ${avg} s\n`;
    });

    await ctx.reply(msg);
  }

  @Command('my_stats')
  async onMyStats(@Ctx() ctx: Context): Promise<void> {
    const chatId = String(ctx.chat?.id);

    const userId = String(ctx.from?.id);

    const stats = await this.messageLoggingService.getOperatorResponseStats(chatId);

    const myStats = stats.filter((s: OperatorStat) => s.operatorId === userId);

    if (!myStats.length) {
      await ctx.reply('Siz hali birorta savolga javob bermagansiz.');
      return;
    }

    const count = myStats.length;
    const totalResponseTime = myStats.reduce<number>(
      (sum, s: OperatorStat) => sum + (s.responseTime || 0),
      0,
    );
    const avg = (totalResponseTime / count).toFixed(1);

    let msg = 'Sizning statistikangiz:\n';
    msg += `- Javob bergan savollar: ${count}\n`;
    msg += `- O'rtacha javob vaqti: ${avg} sekund\n`;

    await ctx.reply(msg);
  }

  @Command('review_ai_result')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERVISOR)
  async onReviewAiResult(@Ctx() ctx: Context): Promise<void> {
    const results = await this.aiAnalysisService.findLatest(1);

    if (!results.length) {
      await ctx.reply("Ko'rib chiqilmagan AI natijalari yo'q.");
      return;
    }

    const result = results[0];

    let msg = `AI natijasi (ID: ${result.id}):\n`;
    msg += `- Type: ${result.type}\n`;
    msg += `- Value: ${JSON.stringify(result.result)}\n`;
    msg += `Javob berish uchun: /accept_ai ${result.id} yoki /reject_ai ${result.id}`;

    await ctx.reply(msg);
  }

  @Command('accept_ai')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERVISOR)
  async onAcceptAi(@Ctx() ctx: Context): Promise<void> {
    const message = ctx.message as TelegramMessage | undefined;
    const text = message?.text;

    if (!ctx.from || !message || typeof text !== 'string') {
      await ctx.reply('Xatolik: foydalanuvchi yoki xabar aniqlanmadi.');
      return;
    }

    const [, aiResultId] = text.split(' ');

    await this.humanFeedbackService.giveFeedback(
      Number(aiResultId),
      String(ctx.from.id),
      'ACCEPTED',
    );

    await ctx.reply('AI natijasi qabul qilindi.');
  }

  @Command('reject_ai')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERVISOR)
  async onRejectAi(@Ctx() ctx: Context): Promise<void> {
    const message = ctx.message as TelegramMessage | undefined;
    const text = message?.text;

    if (!ctx.from || !message || typeof text !== 'string') {
      await ctx.reply('Xatolik: foydalanuvchi yoki xabar aniqlanmadi.');
      return;
    }

    const [, aiResultId] = text.split(' ');

    await this.humanFeedbackService.giveFeedback(
      Number(aiResultId),
      String(ctx.from.id),
      'REJECTED',
    );

    await ctx.reply('AI natijasi rad etildi.');
  }

  @Command('ai_feedback_stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERVISOR, UserRole.ADMIN)
  async onAiFeedbackStats(@Ctx() ctx: Context): Promise<void> {
    const stats = await this.humanFeedbackService.getFeedbackStats(20);

    if (!stats.length) {
      await ctx.reply('Hech qanday AI feedback statistikasi topilmadi.');
      return;
    }

    let msg = 'Oxirgi 20 ta AI natija uchun feedback statistikasi:\n';
    stats.forEach((row: FeedbackStats) => {
      msg += `- ${row.feedback}: ${row.count} ta\n`;
    });

    await ctx.reply(msg);
  }

  @Command('ai_operator_stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERVISOR, UserRole.ADMIN)
  async onAiOperatorStats(@Ctx() ctx: Context): Promise<void> {
    const stats = await this.humanFeedbackService.getOperatorFeedbackStats(20);

    if (!stats.length) {
      await ctx.reply('Hech qanday operator feedback statistikasi topilmadi.');
      return;
    }

    let msg = 'Oxirgi 20 ta feedback uchun operatorlar kesimidagi statistika:\n';
    let lastSupervisor: string | null = null;

    stats.forEach((row: DetailedFeedbackStats) => {
      if (row.supervisorId !== lastSupervisor) {
        msg += `\nSupervisor ID: ${row.supervisorId}\n`;
        lastSupervisor = row.supervisorId;
      }
      msg += `- ${row.feedback}: ${row.count} ta\n`;
    });

    await ctx.reply(msg);
  }

  @Command('ai_operator_stats_detailed')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERVISOR, UserRole.ADMIN)
  async onAiOperatorStatsDetailed(@Ctx() ctx: Context): Promise<void> {
    const stats = await this.humanFeedbackService.getOperatorFeedbackStatsDetailed(20);

    if (!stats.length) {
      await ctx.reply(
        'Hech qanday batafsil operator feedback statistikasi topilmadi.',
      );
      return;
    }

    let msg = 'Oxirgi 20 ta feedback uchun operatorlar va AI natija turi ' +
      '(sentiment/reply) kesimidagi batafsil statistika:\n';

    let lastSupervisor: string | null = null;
    let lastType: string | null = null;

    stats.forEach((row: DetailedFeedbackStats) => {
      if (row.supervisorId !== lastSupervisor) {
        msg += `\nSupervisor ID: ${row.supervisorId}\n`;
        lastSupervisor = row.supervisorId;
        lastType = null;
      }
      if (row.resultType !== lastType) {
        msg += `  Natija turi: ${row.resultType}\n`;
        lastType = row.resultType;
      }
      msg += `    - ${row.feedback}: ${row.count} ta\n`;
    });

    await ctx.reply(msg);
  }

  @Start()
  async onStart(@Ctx() ctx: Context): Promise<void> {
    this.logger.log('<<<<< START HANDLER EXECUTED! >>>>>');

    if (ctx.from && ctx.chat) {
      await this.userService.findOrCreateUserFromTelegramContext(ctx.message, UserRole.CLIENT);
    }

    await ctx.reply('Xush kelibsiz!');
  }

  @Help()
  async onHelp(@Ctx() ctx: Context): Promise<void> {
    this.logger.log('<<<<< HELP HANDLER EXECUTED! >>>>>');
    await ctx.reply('Yordam: /start, /help');
  }

  @Command('assign_role')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async assignRole(@Ctx() ctx: Context): Promise<void> {
    this.logger.log('<<<<< ASSIGN_ROLE COMMAND HANDLER EXECUTED! >>>>>');

    const text = ctx.message && 'text' in ctx.message ? ctx.message.text : undefined;

    if (!text) {
      await ctx.reply(
        'Xabar matni topilmadi. Foydalanish: /assign_role <userId> <role> <chatId>',
      );
      return;
    }

    const [targetTelegramId, newRole, chatId] = text.split(' ').slice(1);

    try {
      if (!ctx.from || typeof ctx.from.id === 'undefined') {
  await ctx.reply('Foydalanuvchi topilmadi');
  return;
}
const userId = await this.userService.getUserIdByTelegram(ctx.from.id);
if (!userId) {
  await ctx.reply('Foydalanuvchi topilmadi');
  return;
}
await this.userService.assignRoleToUserInChat(
  userId,
  chatId,
  newRole as UserRole,
  ctx.from?.id ? String(ctx.from?.id) : undefined,
);

      await ctx.reply(
        `Rol muvaffaqiyatli tayinlandi: ${targetTelegramId} -> ${newRole}`,
      );

      
    } catch (e) {
      const error = e as ErrorWithMessage;
      await ctx.reply(`Xatolik: ${error.message}`);
    }
  }

  @On('text')
  async onText(@Ctx() ctx: Context): Promise<void> {
    this.logger.log('<<<<< ON_TEXT HANDLER EXECUTED! >>>>>');

    const message = ctx.message as TelegramMessage | undefined;
    const text = message?.text;

    if (message && typeof text === 'string' && text.startsWith('/')) {
      return;
    }

    const log = await this.messageLoggingService.logMessage(ctx);

    if (!log) {
      return;
    }

    if (
      log.senderRoleAtMoment === 'CLIENT' &&
      typeof log.textContent === 'string' &&
      log.textContent.trim().endsWith('?')
    ) {
      log.isQuestion = true;
      await this.responseTimeTrackingService.processClientQuestion(log);
    }

    if (typeof log.isReplyToMessageId === 'number') {
      await this.responseTimeTrackingService.processPotentialAnswer(log);
    }
  }
}
