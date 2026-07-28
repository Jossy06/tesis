import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ServiceGroupsService } from './service-groups.service';
import { ServiceGroupsController } from './service-groups.controller';
import { ServiceGroup } from './entities/service-group.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ServiceGroup,
    ]),
  ],
  controllers: [
    ServiceGroupsController,
  ],
  providers: [
    ServiceGroupsService,
  ],
  exports: [
    ServiceGroupsService,
  ],
})
export class ServiceGroupsModule {}