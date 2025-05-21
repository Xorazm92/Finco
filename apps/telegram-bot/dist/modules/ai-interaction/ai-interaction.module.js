"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiInteractionModule = void 0;
const common_1 = require("@nestjs/common");
const ai_interaction_service_1 = require("./ai-interaction.service");
const ai_queue_service_1 = require("./ai-queue.service");
let AiInteractionModule = class AiInteractionModule {
};
exports.AiInteractionModule = AiInteractionModule;
exports.AiInteractionModule = AiInteractionModule = __decorate([
    (0, common_1.Module)({
        providers: [ai_interaction_service_1.AiInteractionService, ai_queue_service_1.AiQueueService],
    })
], AiInteractionModule);
//# sourceMappingURL=ai-interaction.module.js.map