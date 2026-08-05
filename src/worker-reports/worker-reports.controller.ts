import {
  Controller,
  Get,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import type {
  Response,
} from 'express';

import {
  JwtAuthGuard,
} from '../auth/guards/jwt-auth.guard';

import {
  WorkerReportsService,
} from './worker-reports.service';

@UseGuards(
  JwtAuthGuard,
)
@Controller(
  'worker-reports',
)
export class WorkerReportsController {
  constructor(
    private readonly workerReportsService:
      WorkerReportsService,
  ) {}

  @Get('me')
  getMyReport(
    @Req()
    req: any,

    @Query('from')
    from?: string,

    @Query('to')
    to?: string,
  ) {
    return this.workerReportsService.getMyReport(
      req.user.id,
      from,
      to,
    );
  }

  @Get('me/pdf')
  generateMyReportPdf(
    @Req()
    req: any,

    @Res()
    res: Response,

    @Query('from')
    from?: string,

    @Query('to')
    to?: string,
  ) {
    return this.workerReportsService.generateMyReportPdf(
      req.user.id,
      res,
      from,
      to,
    );
  }
}