import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ServiceGroupsService } from './service-groups.service';
import { CreateServiceGroupDto } from './dto/create-service-group.dto';
import { UpdateServiceGroupDto } from './dto/update-service-group.dto';

@Controller('service-groups')
export class ServiceGroupsController {
  constructor(private readonly serviceGroupsService: ServiceGroupsService) {}

  @Post()
  create(@Body() createServiceGroupDto: CreateServiceGroupDto) {
    return this.serviceGroupsService.create(createServiceGroupDto);
  }

  @Get()
  findAll() {
    return this.serviceGroupsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceGroupsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateServiceGroupDto: UpdateServiceGroupDto) {
    return this.serviceGroupsService.update(+id, updateServiceGroupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serviceGroupsService.remove(+id);
  }
}
