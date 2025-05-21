import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { aiConfig } from './ai.config';

@Injectable()
export class PromptEngineeringService {
  private readonly promptDir = aiConfig.promptDir;

  getPrompt(
    templateName: string,
    variables: Record<string, string | number> = {},
  ): string {
    const filePath = path.join(this.promptDir, `${templateName}.txt`);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Prompt template not found: ${filePath}`);
    }
    let template = fs.readFileSync(filePath, 'utf-8');
    for (const [key, value] of Object.entries(variables)) {
      template = template.replace(
        new RegExp(`{{\s*${key}\s*}}`, 'g'),
        String(value),
      );
    }
    return template;
  }
}
