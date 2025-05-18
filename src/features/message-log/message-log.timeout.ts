import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { MessageLogEntity } from './entities/message-log.entity';

@Injectable()
export class MessageLogTimeoutService {
  constructor(
    @InjectRepository(MessageLogEntity)
    private readonly messageLogRepo: Repository<MessageLogEntity>,
  ) {}

  /**
   * Savolga javob berilmagan vaqtda questionStatus = 'TIMEOUT' qilish uchun.
   * @param timeoutSeconds - Savol uchun maksimal ruxsat etilgan kutish vaqti (sekundlarda)
   */
  async markTimeoutQuestions(timeoutSeconds: number = 600): Promise<number> {
    const now = new Date();
    const timeoutDate = new Date(now.getTime() - timeoutSeconds * 1000);
    const unanswered = await this.messageLogRepo.find({
      where: {
        isQuestion: true,
        questionStatus: 'PENDING',
        sentAt: LessThan(timeoutDate),
      },
    });
    for (const msg of unanswered) {
      msg.questionStatus = 'TIMEOUT';
      msg.answerDetectionMethod = 'timeout';
      await this.messageLogRepo.save(msg);
    }
    return unanswered.length;
  }
}
