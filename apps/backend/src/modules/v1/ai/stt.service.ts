import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as FormData from 'form-data';

@Injectable()
export class SttService {
  private readonly logger = new Logger(SttService.name);
  private readonly sttServiceUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.sttServiceUrl =
      this.configService.get<string>('STT_SERVICE_URL') || '';
    if (!this.sttServiceUrl) {
      this.logger.error(
        'STT_SERVICE_URL is not defined in environment variables.',
      );
      throw new Error('STT Service URL is not configured.');
    }
  }

  async transcribeAudio(
    audioBuffer: Buffer,
    fileName: string,
    langCode: string = 'auto',
    task: string = 'transcribe',
    initialPrompt: string = '',
  ): Promise<{ text: string; startTime: number; endTime: number }> {
    const formData = new FormData();
    formData.append('audio_file', audioBuffer, {
      filename: fileName,
      contentType: 'audio/ogg',
    });
    formData.append('lang_code', langCode);
    formData.append('task', task);
    if (initialPrompt) {
      formData.append('initial_prompt', initialPrompt);
    }

    try {
      this.logger.log(
        `Sending audio for transcription to STT service: ${fileName}`,
      );
      const response = await axios.post(
        `${this.sttServiceUrl}/transcribe`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          timeout: 60000,
        },
      );

      const result = response.data;
      this.logger.log(
        `Transcription received for ${fileName}: ${result.text.substring(0, 50)}...`,
      );
      return {
        text: result.text,
        startTime: result.start_time,
        endTime: result.end_time,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error(
          `STT service error: ${error.response?.status} - ${error.response?.data?.detail || error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(
          `Unknown error during STT transcription: ${error.message}`,
          error.stack,
        );
      }
      throw new InternalServerErrorException('Failed to transcribe audio.');
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.sttServiceUrl}/health`, {
        timeout: 5000,
      });
      return response.status === 200 && response.data.model_loaded === true;
    } catch (error) {
      this.logger.warn(`STT Service health check failed: ${error.message}`);
      return false;
    }
  }
}
