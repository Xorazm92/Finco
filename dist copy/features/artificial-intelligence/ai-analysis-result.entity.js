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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiAnalysisResultEntity = void 0;
const typeorm_1 = require("typeorm");
const message_log_entity_1 = require("../message-log/message-log.entity");
let AiAnalysisResultEntity = class AiAnalysisResultEntity {
};
exports.AiAnalysisResultEntity = AiAnalysisResultEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], AiAnalysisResultEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => message_log_entity_1.MessageLogEntity),
    __metadata("design:type", message_log_entity_1.MessageLogEntity)
], AiAnalysisResultEntity.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)('float', { nullable: true }),
    __metadata("design:type", Number)
], AiAnalysisResultEntity.prototype, "answer_quality_score", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], AiAnalysisResultEntity.prototype, "answer_quality_feedback", void 0);
__decorate([
    (0, typeorm_1.Column)('boolean', { default: false }),
    __metadata("design:type", Boolean)
], AiAnalysisResultEntity.prototype, "supervisor_approved", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AiAnalysisResultEntity.prototype, "created_at", void 0);
exports.AiAnalysisResultEntity = AiAnalysisResultEntity = __decorate([
    (0, typeorm_1.Entity)('ai_analysis_result')
], AiAnalysisResultEntity);
