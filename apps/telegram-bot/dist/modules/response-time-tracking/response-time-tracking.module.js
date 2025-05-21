"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseTimeTrackingModule = void 0;
const common_1 = require("@nestjs/common");
const response_time_tracking_service_1 = require("./response-time-tracking.service");
const response_time_tracking_update_1 = require("./response-time-tracking.update");
let ResponseTimeTrackingModule = class ResponseTimeTrackingModule {
};
exports.ResponseTimeTrackingModule = ResponseTimeTrackingModule;
exports.ResponseTimeTrackingModule = ResponseTimeTrackingModule = __decorate([
    (0, common_1.Module)({
        providers: [response_time_tracking_service_1.ResponseTimeTrackingService, response_time_tracking_update_1.ResponseTimeTrackingUpdate],
    })
], ResponseTimeTrackingModule);
//# sourceMappingURL=response-time-tracking.module.js.map