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
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const attendance_log_entity_1 = require("./attendance-log.entity");
const user_entity_1 = require("../user/user.entity");
let AttendanceService = class AttendanceService {
    constructor(attendanceRepo, userRepo) {
        this.attendanceRepo = attendanceRepo;
        this.userRepo = userRepo;
    }
    async checkin(userId, photoUrl) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user)
            throw new Error('User not found');
        const log = this.attendanceRepo.create({
            user,
            type: photoUrl ? 'faceid' : 'checkin',
            photo_url: photoUrl,
        });
        return this.attendanceRepo.save(log);
    }
    async checkout(userId) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user)
            throw new Error('User not found');
        const log = this.attendanceRepo.create({
            user,
            type: 'checkout',
        });
        return this.attendanceRepo.save(log);
    }
    async getAttendanceForUser(userId) {
        return this.attendanceRepo.find({ where: { user: { id: userId } }, relations: ['user'] });
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(attendance_log_entity_1.AttendanceLogEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], AttendanceService);
