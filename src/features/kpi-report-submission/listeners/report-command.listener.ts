import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ReportSubmissionService } from '../report-submission.service';

@Injectable()
export class ReportCommandListener {
  constructor(
    private readonly reportSubmissionService: ReportSubmissionService,
  ) {}

  @OnEvent('telegram.report.submitted')
  async handleReport(payload: any) {
    await this.reportSubmissionService.processReport(payload);
  }
}
