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
exports.KpiService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const kpi_score_entity_1 = require("./kpi-score.entity");
const user_entity_1 = require("../user/user.entity");
let KpiService = class KpiService {
    constructor(kpiRepo, userRepo) {
        this.kpiRepo = kpiRepo;
        this.userRepo = userRepo;
    }
    async upsertKpiScore(data) {
        const user = await this.userRepo.findOne({ where: { id: data.userId } });
        if (!user)
            throw new Error('User not found');
        let kpi = await this.kpiRepo.findOne({ where: { user: { id: data.userId }, period: data.period } });
        if (!kpi) {
            kpi = this.kpiRepo.create({
                user,
                period: data.period,
                response_time_score: data.responseTimeScore,
                answer_quality_score: data.answerQualityScore,
                attendance_score: data.attendanceScore,
                report_submission_score: data.reportSubmissionScore,
                total_score: data.totalScore,
            });
        }
        else {
            kpi.response_time_score = data.responseTimeScore;
            kpi.answer_quality_score = data.answerQualityScore;
            kpi.attendance_score = data.attendanceScore;
            kpi.report_submission_score = data.reportSubmissionScore;
            kpi.total_score = data.totalScore;
        }
        return this.kpiRepo.save(kpi);
    }
    async getKpiForUser(userId, period) {
        return this.kpiRepo.findOne({ where: { user: { id: userId }, period } });
    }
    async getAllKpi(period) {
        return this.kpiRepo.find({ where: { period }, relations: ['user'] });
    }
};
exports.KpiService = KpiService;
exports.KpiService = KpiService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(kpi_score_entity_1.KpiScoreEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], KpiService);
