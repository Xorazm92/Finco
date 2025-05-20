import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyEntity } from './entities/company.entity';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(CompanyEntity)
    private readonly companyRepo: Repository<CompanyEntity>,
  ) {}

  async create(data: Partial<CompanyEntity>) {
    return this.companyRepo.save(data);
  }

  async findAll() {
    return this.companyRepo.find();
  }

  async findOne(id: number) {
    return this.companyRepo.findOneBy({ id });
  }

  async update(id: number, data: Partial<CompanyEntity>) {
    await this.companyRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    return this.companyRepo.delete(id);
  }
}
