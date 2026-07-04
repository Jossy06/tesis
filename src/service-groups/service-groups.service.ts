import { Injectable } from '@nestjs/common';
import { CreateServiceGroupDto } from './dto/create-service-group.dto';
import { UpdateServiceGroupDto } from './dto/update-service-group.dto';

@Injectable()
export class ServiceGroupsService {
  create(createServiceGroupDto: CreateServiceGroupDto) {
    return 'This action adds a new serviceGroup';
  }

  findAll() {
    return `This action returns all serviceGroups`;
  }

  findOne(id: number) {
    return `This action returns a #${id} serviceGroup`;
  }

  update(id: number, updateServiceGroupDto: UpdateServiceGroupDto) {
    return `This action updates a #${id} serviceGroup`;
  }

  remove(id: number) {
    return `This action removes a #${id} serviceGroup`;
  }
}
