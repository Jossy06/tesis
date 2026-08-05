import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { SettingsService } from './settings.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Controller('settings')
export class SettingsController {
  constructor(
    private readonly settingsService:
      SettingsService,
  ) {}

  @Post()
  create(
    @Body()
    createSettingDto: CreateSettingDto,
  ) {
    return this.settingsService.create(
      createSettingDto,
    );
  }

  @Get()
  findAll() {
    return this.settingsService.findAll();
  }

  @Get('current')
  findCurrent() {
    return this.settingsService.findCurrent();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    return this.settingsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe)
    id: string,

    @Body()
    updateSettingDto: UpdateSettingDto,
  ) {
    return this.settingsService.update(
      id,
      updateSettingDto,
    );
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    return this.settingsService.remove(id);
  }
}