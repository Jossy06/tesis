import { PartialType } from '@nestjs/swagger';
import { CreateCalculationDto } from './create-calculation.dto';

export class UpdateCalculationDto extends PartialType(CreateCalculationDto) {}
