import { Module } from '@nestjs/common';
import { ServiceGroupsService } from './service-groups.service';
import { ServiceGroupsController } from './service-groups.controller';

@Module({
  controllers: [ServiceGroupsController],
  providers: [ServiceGroupsService],
})
export class ServiceGroupsModule {}
