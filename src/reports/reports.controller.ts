import { Controller, Get } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
  ) {}

  @Get('sales')
  getSalesReport() {
    return this.reportsService.getSalesReport();
  }

  @Get('services')
  getTopServices() {
    return this.reportsService.getTopServices();
  }

  @Get('clients')
  getTopClients() {
    return this.reportsService.getTopClients();
  }

  @Get('monthly-sales')
  getMonthlySales() {
    return this.reportsService.getMonthlySales();
  }
}{}
