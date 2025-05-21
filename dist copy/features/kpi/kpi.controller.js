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
exports.KpiController = void 0;
const common_1 = require("@nestjs/common");
const kpi_service_1 = require("./kpi.service");
let KpiController = class KpiController {
    constructor(kpiService) {
        this.kpiService = kpiService;
    }
    async upsertKpiScore(dto) {
        return this.kpiService.upsertKpiScore(dto);
    }
    async getKpiForUser(userId, period) {
        return this.kpiService.getKpiForUser(userId, period);
    }
    async getAllKpi(period) {
        return this.kpiService.getAllKpi(period);
    }
};
exports.KpiController = KpiController;
__decorate([
    (0, common_1.Post)('upsert'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KpiController.prototype, "upsertKpiScore", null);
__decorate([
    (0, common_1.Get)('user/:userId/:period'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], KpiController.prototype, "getKpiForUser", null);
__decorate([
    (0, common_1.Get)('all/:period'),
    __param(0, (0, common_1.Param)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KpiController.prototype, "getAllKpi", null);
exports.KpiController = KpiController = __decorate([
    (0, common_1.Controller)('kpi'),
    __metadata("design:paramtypes", [kpi_service_1.KpiService])
], KpiController);
