import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceDetailsService } from './invoice-details.service';

describe('InvoiceDetailsService', () => {
  let service: InvoiceDetailsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InvoiceDetailsService],
    }).compile();

    service = module.get<InvoiceDetailsService>(InvoiceDetailsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
