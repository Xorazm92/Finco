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
exports.AiAnalysisService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ai_analysis_result_entity_1 = require("./ai-analysis-result.entity");
const message_log_entity_1 = require("../message-log/message-log.entity");
let AiAnalysisService = class AiAnalysisService {
    constructor(aiAnalysisRepo, messageLogRepo) {
        this.aiAnalysisRepo = aiAnalysisRepo;
        this.messageLogRepo = messageLogRepo;
    }
    async evaluateAnswerQuality(question, answer) {
        // LLM prompt
        const prompt = `Savol: ${question}\nJavob: ${answer}\nJavob savolga to‘liq va savodli javob beradimi? 0-100 ball bilan baholang va qisqa izoh yozing.`;
        // const llmResponse = await this.llmClient.ask(prompt);
        // Misol uchun mock natija:
        const llmResponse = { score: 87, feedback: "Javob to‘liq va aniq, lekin qisqacha izoh yetishmaydi." };
        return llmResponse;
    }
    async analyzeMessagePair(questionMsgId, answerMsgId) {
        var _a, _b;
        const question = await this.messageLogRepo.findOne({ where: { id: questionMsgId } });
        const answer = await this.messageLogRepo.findOne({ where: { id: answerMsgId } });
        if (!question || !answer)
            throw new Error('Question or answer message not found');
        // Use 'text' or 'content' property based on your MessageLogEntity
        const { score, feedback } = await this.evaluateAnswerQuality((_a = question.textContent) !== null && _a !== void 0 ? _a : '', (_b = answer.textContent) !== null && _b !== void 0 ? _b : '');
        const result = this.aiAnalysisRepo.create({
            message: answer,
            answer_quality_score: score,
            answer_quality_feedback: feedback,
            supervisor_approved: false,
        });
        return this.aiAnalysisRepo.save(result);
    }
};
exports.AiAnalysisService = AiAnalysisService;
exports.AiAnalysisService = AiAnalysisService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ai_analysis_result_entity_1.AiAnalysisResultEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(message_log_entity_1.MessageLogEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], AiAnalysisService);
