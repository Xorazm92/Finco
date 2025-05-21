"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const kpi_service_1 = require("../kpi/kpi.service");
const payroll_service_1 = require("../payroll/payroll.service");
const report_service_1 = require("../report/report.service");
const attendance_service_1 = require("../attendance/attendance.service");
const json2csv_1 = require("json2csv");
let DashboardController = class DashboardController {
    constructor(kpiService, payrollService, reportService, attendanceService) {
        this.kpiService = kpiService;
        this.payrollService = payrollService;
        this.reportService = reportService;
        this.attendanceService = attendanceService;
    }
    async getKpi(period) {
        return this.kpiService.getAllKpi(period);
    }
    async getPayroll(period) {
        return this.payrollService.getAllPayrolls(period);
    }
    async getReports(userId) {
        return this.reportService.getUserReports(userId);
    }
    async getAttendance(userId) {
        return this.attendanceService.getAttendanceForUser(userId);
    }
    async exportPayroll(period, res) {
        const payrolls = await this.payrollService.getAllPayrolls(period);
        const fields = ['user.id', 'user.name', 'period', 'base_salary', 'kpi_bonus', 'penalty', 'advance', 'total_salary'];
        const parser = new json2csv_1.Parser({ fields });
        const csv = parser.parse(payrolls);
        res.header('Content-Type', 'text/csv');
        res.attachment(`payroll_${period}.csv`);
        return res.send(csv);
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('kpi'),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getKpi", null);
__decorate([
    (0, common_1.Get)('payroll'),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getPayroll", null);
__decorate([
    (0, common_1.Get)('reports'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getReports", null);
__decorate([
    (0, common_1.Get)('attendance'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getAttendance", null);
__decorate([
    (0, common_1.Get)('payroll/export'),
    __param(0, (0, common_1.Query)('period')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "exportPayroll", null);
exports.DashboardController = DashboardController = __decorate([
    (0, common_1.Controller)('dashboard'),
    __metadata("design:paramtypes", [kpi_service_1.KpiService,
        payroll_service_1.PayrollService,
        report_service_1.ReportService,
        attendance_service_1.AttendanceService])
], DashboardController);
