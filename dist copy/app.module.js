"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const artificial_intelligence_module_1 = require("./features/artificial-intelligence/artificial-intelligence.module");
const attendance_module_1 = require("./features/attendance/attendance.module");
const report_module_1 = require("./features/report/report.module");
const payroll_module_1 = require("./features/payroll/payroll.module");
const kpi_module_1 = require("./features/kpi/kpi.module");
const dashboard_module_1 = require("./features/dashboard/dashboard.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot(),
            artificial_intelligence_module_1.ArtificialIntelligenceModule,
            attendance_module_1.AttendanceModule,
            report_module_1.ReportModule,
            payroll_module_1.PayrollModule,
            kpi_module_1.KpiModule,
            dashboard_module_1.DashboardModule,
        ],
    })
], AppModule);
