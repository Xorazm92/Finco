
import { Injectable } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { AiService } from '../artificial-intelligence/ai.service';
import { UserService } from '../user-management/user.service';

@Injectable()
@Processor('message-queue')
export class MessageProcessorConsumer {
  constructor(
    private readonly aiService: AiService,
    private readonly userService: UserService,
  ) {}

  @Process('analyze-message')
  async handleMessageAnalysis(job: Job) {
    const { message, userId } = job.data;
    
    // AI tahlil
    const analysis = await this.aiService.analyzeMessage(message);
    
    // Savol/javob aniqlash
    if (analysis.isQuestion) {
      await this.handleQuestion(message, userId);
    } else {
      await this.handleAnswer(message, userId);
    }
    
    return analysis;
  }

  private async handleQuestion(message: string, userId: number) {
    // Savolni qayta ishlash logikasi
    const response = await this.aiService.generateResponse({
      message,
      userId,
      type: 'question'
    });
    return response;
  }

  private async handleAnswer(message: string, userId: number) {
    // Javobni qayta ishlash logikasi
    const response = await this.aiService.generateResponse({
      message,
      userId,
      type: 'answer'
    });
    return response;
  }
}
