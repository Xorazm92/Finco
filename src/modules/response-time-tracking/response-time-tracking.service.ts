import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageLog } from '../message-logging/message-log.entity';
import { AiAnalysisService } from '../ai/ai-analysis.service';

@Injectable()
export class ResponseTimeTrackingService {
  constructor(
    @InjectRepository(MessageLog) private messageLogRepo: Repository<MessageLog>,
    private aiAnalysisService: AiAnalysisService,
  ) {}

  async processClientQuestion(messageLog: MessageLog) {
    if (messageLog.isQuestion && messageLog.senderRoleAtMoment === 'CLIENT') {
      messageLog.questionStatus = 'PENDING';
      await this.messageLogRepo.save(messageLog);
      // Sentiment analysis for client question
      if (messageLog.textContent) {
        await this.aiAnalysisService.analyzeSentiment(
          messageLog.telegramMessageId,
          messageLog.telegramChatId,
          messageLog.textContent,
        );
      }
    }
  }

  async processPotentialAnswer(potentialAnswerLog: MessageLog) {
    if (potentialAnswerLog.isReplyToMessageId) {
      const question = await this.messageLogRepo.findOne({
        where: {
          telegramMessageId: potentialAnswerLog.isReplyToMessageId,
          telegramChatId: potentialAnswerLog.telegramChatId,
          isQuestion: true,
          questionStatus: 'PENDING',
        },
      });
      if (question) {
        question.questionStatus = 'ANSWERED';
        question.answeredByMessageId = potentialAnswerLog.telegramMessageId;
        question.responseTimeSeconds =
          (potentialAnswerLog.sentAt.getTime() - question.sentAt.getTime()) / 1000;
        await this.messageLogRepo.save(question);
        // Sentiment analysis for operator answer
        if (potentialAnswerLog.textContent) {
          await this.aiAnalysisService.analyzeSentiment(
            potentialAnswerLog.telegramMessageId,
            potentialAnswerLog.telegramChatId,
            potentialAnswerLog.textContent,
          );
        }
      }
    } else {
      // AI-based reply detection for non-reply answers
      // Find the latest unanswered client question in the same chat
      const previousQuestion = await this.messageLogRepo.findOne({
        where: {
          telegramChatId: potentialAnswerLog.telegramChatId,
          isQuestion: true,
          questionStatus: 'PENDING',
        },
        order: { sentAt: 'DESC' },
      });
      if (potentialAnswerLog.textContent && previousQuestion && previousQuestion.textContent) {
        await this.aiAnalysisService.analyzeIsReply(
          potentialAnswerLog.telegramMessageId,
          potentialAnswerLog.telegramChatId,
          potentialAnswerLog.textContent,
          previousQuestion.textContent,
        );
      }
      // Sentiment analysis for operator answer (non-reply)
      if (potentialAnswerLog.textContent) {
        await this.aiAnalysisService.analyzeSentiment(
          potentialAnswerLog.telegramMessageId,
          potentialAnswerLog.telegramChatId,
          potentialAnswerLog.textContent,
        );
      }
    }
  }
}
