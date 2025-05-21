"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RbacService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RbacService = void 0;
const common_1 = require("@nestjs/common");
let RbacService = RbacService_1 = class RbacService {
    logger = new common_1.Logger(RbacService_1.name);
};
exports.RbacService = RbacService;
exports.RbacService = RbacService = RbacService_1 = __decorate([
    (0, common_1.Injectable)()
], RbacService);
//# sourceMappingURL=rbac.service.js.map