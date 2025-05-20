import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCompanyAssignmentEntity } from './entities/user-company-assignment.entity';

@Injectable()
export class UserCompanyAssignmentService {
  constructor(
    @InjectRepository(UserCompanyAssignmentEntity)
    private readonly assignmentRepo: Repository<UserCompanyAssignmentEntity>,
  ) {}

  async create(data: Partial<UserCompanyAssignmentEntity>) {
    return this.assignmentRepo.save(data);
  }

  async findAll() {
    return this.assignmentRepo.find({ relations: ['user', 'company'] });
  }

  async findOne(id: number) {
    return this.assignmentRepo.findOne({ where: { id }, relations: ['user', 'company'] });
  }

  async findByUserAndCompany(userId: number, companyId: number) {
    return this.assignmentRepo.findOne({
      where: { user: { id: userId }, company: { id: companyId } },
      relations: ['user', 'company'],
    });
  }

  async update(id: number, data: Partial<UserCompanyAssignmentEntity>) {
    await this.assignmentRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    return this.assignmentRepo.delete(id);
  }
}
