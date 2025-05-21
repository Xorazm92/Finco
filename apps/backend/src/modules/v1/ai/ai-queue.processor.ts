import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { AiTaskCoordinatorService } from './ai-task-coordinator.service';
import { AiAnalysisResultService } from './ai-analysis-result.service';

@Processor('ai-tasks')
@Injectable()
export class AiQueueProcessor {
  private readonly logger = new Logger(AiQueueProcessor.name);
  constructor(
    private readonly aiTaskCoordinator: AiTaskCoordinatorService,
    private readonly aiAnalysisResultService: AiAnalysisResultService,
  ) {}

  @Process('sentiment')
  async handleSentimentJob(job: Job<{ text: string }>) {
    this.logger.log(`Processing sentiment job: ${JSON.stringify(job.data)}`);
    try {
      const result = await this.aiTaskCoordinator.analyzeSentiment(
        job.data.text,
      );
      await this.aiAnalysisResultService.saveResult({
        type: 'sentiment',
        inputText: job.data.text,
        result,
        jobId: String(job.id),
        llmModel: undefined,
        promptVersion: undefined,
      });
      return result;
    } catch (err) {
      this.logger.error('Sentiment job failed', err);
      throw err;
    }
  }

  @Process('question_analysis')
  async handleQuestionAnalysisJob(job: Job<{ text: string }>) {
    this.logger.log(
      `Processing question_analysis job: ${JSON.stringify(job.data)}`,
    );
    try {
      const result = await this.aiTaskCoordinator.analyzeQuestion(
        job.data.text,
      );
      await this.aiAnalysisResultService.saveResult({
        type: 'question_analysis',
        inputText: job.data.text,
        result,
        jobId: String(job.id),
        llmModel: undefined,
        promptVersion: undefined,
      });
      return result;
    } catch (err) {
      this.logger.error('Question analysis job failed', err);
      throw err;
    }
  }

  @Process('reply_analysis')
  async handleReplyAnalysisJob(job: Job<{ question: string; answer: string }>) {
    this.logger.log(
      `Processing reply_analysis job: ${JSON.stringify(job.data)}`,
    );
    try {
      const result = await this.aiTaskCoordinator.analyzeReply(
        job.data.question,
        job.data.answer,
      );
      await this.aiAnalysisResultService.saveResult({
        type: 'reply_analysis',
        inputText: JSON.stringify(job.data),
        result,
        jobId: String(job.id),
        llmModel: undefined,
        promptVersion: undefined,
      });
      return result;
    } catch (err) {
      this.logger.error('Reply analysis job failed', err);
      throw err;
    }
  }
}
