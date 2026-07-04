import { Test, TestingModule } from '@nestjs/testing';
import { ServiceGroupsService } from './service-groups.service';

describe('ServiceGroupsService', () => {
  let service: ServiceGroupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServiceGroupsService],
    }).compile();

    service = module.get<ServiceGroupsService>(ServiceGroupsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
