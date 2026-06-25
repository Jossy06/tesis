import { PartialType } from '@nestjs/mapped-types';
import { CreateServiceMaterialDto } from './create-service-material.dto';

export class UpdateServiceMaterialDto extends PartialType(
  CreateServiceMaterialDto,
) {}