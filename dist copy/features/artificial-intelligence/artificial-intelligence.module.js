"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtificialIntelligenceModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bull_1 = require("@nestjs/bull");
const ai_analysis_service_1 = require("./ai-analysis.service");
const ai_analysis_controller_1 = require("./ai-analysis.controller");
const ai_analysis_result_entity_1 = require("./ai-analysis-result.entity");
const message_log_entity_1 = require("../message-log/message-log.entity");
let ArtificialIntelligenceModule = class ArtificialIntelligenceModule {
};
exports.ArtificialIntelligenceModule = ArtificialIntelligenceModule;
exports.ArtificialIntelligenceModule = ArtificialIntelligenceModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                ai_analysis_result_entity_1.AiAnalysisResultEntity,
                message_log_entity_1.MessageLogEntity,
            ]),
            bull_1.BullModule.registerQueue({ name: 'stt_queue' }),
            bull_1.BullModule.registerQueue({ name: 'ai_analysis_queue' }),
        ],
        providers: [
            ai_analysis_service_1.AiAnalysisService,
        ],
        controllers: [
            ai_analysis_controller_1.AiAnalysisController,
        ],
        exports: [
            ai_analysis_service_1.AiAnalysisService,
        ],
    })
], ArtificialIntelligenceModule);
