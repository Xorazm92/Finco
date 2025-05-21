import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { SttService } from './stt.service';


@Processor('stt_queue')
export class SttProcessor {
  private readonly logger = new Logger(SttProcessor.name);

  constructor(
    private readonly sttService: SttService,

  ) { }

  @Process('transcribe')
  async handleTranscriptionJob(job: Job<{ audioBuffer: string; fileName: string; messageLogId: string; langCode?: string; task?: string; initialPrompt?: string }>): Promise<void> {
    this.logger.log(`Processing STT job ${job.id} for message ${job.data.messageLogId}`);
    const audioBuffer = Buffer.from(job.data.audioBuffer, 'base64');

    try {
      const { text } = await this.sttService.transcribeAudio(
        audioBuffer,
        job.data.fileName,
        job.data.langCode,
        job.data.task,
        job.data.initialPrompt,
      );

      this.logger.log(`Transcription successful for message ${job.data.messageLogId}: ${text.substring(0, 50)}...`);

    } catch (error) {
      this.logger.error(`Failed to transcribe audio for job ${job.id}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
