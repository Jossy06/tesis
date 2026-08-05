import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import {
  Client,
} from './entities/client.entity';

import {
  CreateClientDto,
} from './dto/create-client.dto';

import {
  UpdateClientDto,
} from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository:
      Repository<Client>,
  ) {}

  async create(
    dto: CreateClientDto,
    userId: string,
  ): Promise<Client> {
    const email =
      dto.email
        ?.trim()
        .toLowerCase() ||
      null;

    if (email) {
      const existing =
        await this.clientRepository.findOne({
          where: {
            email,
          },
        });

      if (existing) {
        throw new ConflictException(
          'El correo ya está registrado',
        );
      }
    }

    const client =
      this.clientRepository.create({
        name:
          dto.name.trim(),

        phone:
          dto.phone.trim(),

        email,

        address:
          dto.address?.trim() ||
          null,

        created_by_user_id:
          userId,
      });

    return this.clientRepository.save(
      client,
    );
  }

  async findAll():
    Promise<Client[]> {
    return this.clientRepository.find({
      relations: {
        created_by: true,
      },

      order: {
        created_at: 'DESC',
      },
    });
  }

  async findOne(
    id: string,
  ): Promise<Client> {
    const client =
      await this.clientRepository.findOne({
        where: {
          id,
        },

        relations: {
          created_by: true,
        },
      });

    if (!client) {
      throw new NotFoundException(
        'Cliente no encontrado',
      );
    }

    return client;
  }

  async update(
    id: string,
    dto: UpdateClientDto,
  ): Promise<Client> {
    const client =
      await this.findOne(id);

    if (
      dto.email !== undefined
    ) {
      const email =
        dto.email
          ?.trim()
          .toLowerCase() ||
        null;

      if (
        email &&
        email !== client.email
      ) {
        const existing =
          await this.clientRepository.findOne({
            where: {
              email,
            },
          });

        if (
          existing &&
          existing.id !== id
        ) {
          throw new ConflictException(
            'El correo ya está registrado',
          );
        }
      }

      client.email = email;
    }

    if (
      dto.name !== undefined
    ) {
      client.name =
        dto.name.trim();
    }

    if (
      dto.phone !== undefined
    ) {
      client.phone =
        dto.phone.trim();
    }

    if (
      dto.address !== undefined
    ) {
      client.address =
        dto.address?.trim() ||
        null;
    }

    return this.clientRepository.save(
      client,
    );
  }

  async remove(
    id: string,
  ): Promise<{
    message: string;
  }> {
    const client =
      await this.findOne(id);

    await this.clientRepository.remove(
      client,
    );

    return {
      message:
        'Cliente eliminado correctamente',
    };
  }
}
