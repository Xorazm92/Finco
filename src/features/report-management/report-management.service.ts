
import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ReportManagementService {
  constructor(
    @Inject('REPORT_SERVICE') private readonly reportClient: ClientProxy,
  ) {}

  async generateReport(params: { userId: string; reportType: string; period: string }) {
    return this.reportClient.send({ cmd: 'generate_report' }, params).toPromise();
  }

  async getReportStatus(reportId: string) {
    return this.reportClient.send({ cmd: 'get_report_status' }, { reportId }).toPromise();
  }
}
