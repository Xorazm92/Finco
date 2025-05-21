"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramModule = void 0;
const common_1 = require("@nestjs/common");
const nestjs_telegraf_1 = require("nestjs-telegraf");
const config_1 = require("@nestjs/config");
const telegram_controller_1 = require("./telegram.controller");
const telegram_service_1 = require("./telegram.service");
const response_time_tracking_module_1 = require("../response-time-tracking/response-time-tracking.module");
const report_submission_tracking_module_1 = require("../report-submission-tracking/report-submission-tracking.module");
const attendance_tracking_module_1 = require("../attendance-tracking/attendance-tracking.module");
const user_management_module_1 = require("../user-management/user-management.module");
const ai_interaction_module_1 = require("../ai-interaction/ai-interaction.module");
const user_kpi_view_module_1 = require("../user-kpi-view/user-kpi-view.module");
const admin_kpi_management_module_1 = require("../admin-kpi-management/admin-kpi-management.module");
const message_logging_module_1 = require("../message-logging/message-logging.module");
const rbac_module_1 = require("../rbac/rbac.module");
let TelegramModule = class TelegramModule {
};
exports.TelegramModule = TelegramModule;
exports.TelegramModule = TelegramModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            nestjs_telegraf_1.TelegrafModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => {
                    const token = configService.get('TELEGRAM_BOT_TOKEN');
                    if (!token) {
                        throw new Error('TELEGRAM_BOT_TOKEN is not defined in .env file');
                    }
                    return { token };
                },
                inject: [config_1.ConfigService],
            }),
            response_time_tracking_module_1.ResponseTimeTrackingModule,
            report_submission_tracking_module_1.ReportSubmissionTrackingModule,
            attendance_tracking_module_1.AttendanceTrackingModule,
            user_management_module_1.UserManagementModule,
            ai_interaction_module_1.AiInteractionModule,
            user_kpi_view_module_1.UserKpiViewModule,
            admin_kpi_management_module_1.AdminKpiManagementModule,
            message_logging_module_1.MessageLoggingModule,
            rbac_module_1.RbacModule,
        ],
        controllers: [telegram_controller_1.TelegramController],
        providers: [telegram_service_1.TelegramService],
        exports: [telegram_service_1.TelegramService],
    })
], TelegramModule);
//# sourceMappingURL=telegram.module.js.map