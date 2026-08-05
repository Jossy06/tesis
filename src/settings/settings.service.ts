import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Setting } from './entities/setting.entity';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private readonly settingRepository:
      Repository<Setting>,
  ) {}

  async create(
    createSettingDto: CreateSettingDto,
  ): Promise<Setting> {
    const existingSetting =
      await this.settingRepository.findOne({
        where: {},
        order: {
          created_at: 'ASC',
        },
      });

    if (existingSetting) {
      Object.assign(
        existingSetting,
        createSettingDto,
      );

      return this.settingRepository.save(
        existingSetting,
      );
    }

    const setting =
      this.settingRepository.create(
        createSettingDto,
      );

    return this.settingRepository.save(
      setting,
    );
  }

  async findAll(): Promise<Setting[]> {
    return this.settingRepository.find({
      order: {
        created_at: 'ASC',
      },
    });
  }

  async findCurrent(): Promise<Setting | null> {
    return this.settingRepository.findOne({
      where: {},
      order: {
        created_at: 'ASC',
      },
    });
  }

  async findOne(
    id: string,
  ): Promise<Setting> {
    const setting =
      await this.settingRepository.findOne({
        where: {
          id,
        },
      });

    if (!setting) {
      throw new NotFoundException(
        'Configuración no encontrada',
      );
    }

    return setting;
  }

  async update(
    id: string,
    updateSettingDto: UpdateSettingDto,
  ): Promise<Setting> {
    const setting =
      await this.findOne(id);

    Object.assign(
      setting,
      updateSettingDto,
    );

    return this.settingRepository.save(
      setting,
    );
  }

  async remove(
    id: string,
  ): Promise<{ message: string }> {
    const setting =
      await this.findOne(id);

    await this.settingRepository.remove(
      setting,
    );

    return {
      message:
        'Configuración eliminada correctamente',
    };
  }
}