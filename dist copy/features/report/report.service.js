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
exports.ReportService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const report_type_entity_1 = require("./report-type.entity");
const report_submission_entity_1 = require("./report-submission.entity");
const user_entity_1 = require("../user/user.entity");
let ReportService = class ReportService {
    constructor(reportTypeRepo, reportSubmissionRepo, userRepo) {
        this.reportTypeRepo = reportTypeRepo;
        this.reportSubmissionRepo = reportSubmissionRepo;
        this.userRepo = userRepo;
    }
    async createReportType(data) {
        const reportType = this.reportTypeRepo.create(data);
        return this.reportTypeRepo.save(reportType);
    }
    async submitReport(data) {
        const reportType = await this.reportTypeRepo.findOne({ where: { id: data.reportTypeId } });
        const user = await this.userRepo.findOne({ where: { id: data.userId } });
        if (!reportType)
            throw new Error('ReportType not found');
        if (!user)
            throw new Error('User not found');
        const submission = this.reportSubmissionRepo.create({
            reportType,
            user,
            status: data.status,
            fileUrl: data.fileUrl,
        });
        return this.reportSubmissionRepo.save(submission);
    }
    async getAllReportTypes() {
        return this.reportTypeRepo.find();
    }
    async getUserReports(userId) {
        return this.reportSubmissionRepo.find({ where: { user: { id: userId } }, relations: ['reportType', 'user'] });
    }
};
exports.ReportService = ReportService;
exports.ReportService = ReportService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(report_type_entity_1.ReportTypeEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(report_submission_entity_1.ReportSubmissionEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ReportService);
