import { Test, TestingModule } from '@nestjs/testing';
import { ServiceGroupsController } from './service-groups.controller';
import { ServiceGroupsService } from './service-groups.service';

describe('ServiceGroupsController', () => {
  let controller: ServiceGroupsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceGroupsController],
      providers: [ServiceGroupsService],
    }).compile();

    controller = module.get<ServiceGroupsController>(ServiceGroupsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
