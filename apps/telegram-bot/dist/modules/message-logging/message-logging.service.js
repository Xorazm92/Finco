"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MessageLoggingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageLoggingService = void 0;
const common_1 = require("@nestjs/common");
let MessageLoggingService = MessageLoggingService_1 = class MessageLoggingService {
    logger = new common_1.Logger(MessageLoggingService_1.name);
};
exports.MessageLoggingService = MessageLoggingService;
exports.MessageLoggingService = MessageLoggingService = MessageLoggingService_1 = __decorate([
    (0, common_1.Injectable)()
], MessageLoggingService);
//# sourceMappingURL=message-logging.service.js.map