import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { ServiceMaterialsService } from './service-materials.service';
import { CreateServiceMaterialDto } from './dto/create-service-material.dto';
import { UpdateServiceMaterialDto } from './dto/update-service-material.dto';

@Controller('service-materials')
export class ServiceMaterialsController {
  constructor(
    private readonly serviceMaterialsService: ServiceMaterialsService,
  ) {}

  @Post()
  create(
    @Body() createServiceMaterialDto: CreateServiceMaterialDto,
  ) {
    return this.serviceMaterialsService.create(
      createServiceMaterialDto,
    );
  }

  @Get()
  findAll() {
    return this.serviceMaterialsService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
  ) {
    return this.serviceMaterialsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateServiceMaterialDto: UpdateServiceMaterialDto,
  ) {
    return this.serviceMaterialsService.update(
      id,
      updateServiceMaterialDto,
    );
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
  ) {
    return this.serviceMaterialsService.remove(id);
  }
}