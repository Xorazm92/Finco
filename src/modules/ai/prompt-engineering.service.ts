import { Injectable } from '@nestjs/common';

@Injectable()
export class PromptEngineeringService {
  buildSentimentPrompt(text: string): string {
    return `Quyidagi xabar sentimentini aniqlang (faqat 'positive', 'neutral', 'negative'): "${text}"`;
  }
  buildIsReplyPrompt(text: string, context: string): string {
    return `Bu xabar: "${text}" quyidagi savolga javobmi? "${context}" (faqat 'yes' yoki 'no' deb javob bering)`;
  }
}
