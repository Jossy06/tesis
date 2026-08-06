import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  QueryFailedError,
  Repository,
} from 'typeorm';

import {
  CreateClientDto,
} from './dto/create-client.dto';

import {
  UpdateClientDto,
} from './dto/update-client.dto';

import {
  Client,
} from './entities/client.entity';

interface PostgreSqlError {
  code?: string;
  detail?: string;
  constraint?: string;
}

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository:
      Repository<Client>,
  ) {}

  async create(
    createClientDto:
      CreateClientDto,
  ): Promise<Client> {
    const normalizedEmail =
      this.normalizeEmail(
        createClientDto.email,
      );

    if (normalizedEmail) {
      const emailExists =
        await this.clientRepository.exists({
          where: {
            email:
              normalizedEmail,
          },
        });

      if (emailExists) {
        throw new ConflictException(
          'El correo electrónico ya está registrado.',
        );
      }
    }

    const client =
      this.clientRepository.create({
        name:
          createClientDto.name.trim(),

        phone:
          createClientDto.phone.trim(),

        email:
          normalizedEmail,

        address:
          createClientDto.address
            ?.trim() || null,
      });

    try {
      return await this.clientRepository.save(
        client,
      );
    } catch (
      error: unknown
    ) {
      this.handleDatabaseError(
        error,
        'No se pudo registrar el cliente.',
      );
    }
  }

  async findAll():
    Promise<Client[]> {
    return this.clientRepository.find({
      order: {
        created_at:
          'DESC',
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
      });

    if (!client) {
      throw new NotFoundException(
        'Cliente no encontrado.',
      );
    }

    return client;
  }

  async update(
    id: string,

    updateClientDto:
      UpdateClientDto,
  ): Promise<Client> {
    const client =
      await this.findOne(id);

    if (
      updateClientDto.email !==
      undefined
    ) {
      const normalizedEmail =
        this.normalizeEmail(
          updateClientDto.email,
        );

      if (normalizedEmail) {
        const emailExists =
          await this.clientRepository
            .createQueryBuilder(
              'client',
            )
            .where(
              'LOWER(client.email) = LOWER(:email)',
              {
                email:
                  normalizedEmail,
              },
            )
            .andWhere(
              'client.id != :id',
              {
                id,
              },
            )
            .getExists();

        if (emailExists) {
          throw new ConflictException(
            'El correo electrónico ya está registrado por otro cliente.',
          );
        }
      }

      client.email =
        normalizedEmail;
    }

    if (
      updateClientDto.name !==
      undefined
    ) {
      client.name =
        updateClientDto.name.trim();
    }

    if (
      updateClientDto.phone !==
      undefined
    ) {
      client.phone =
        updateClientDto.phone.trim();
    }

    if (
      updateClientDto.address !==
      undefined
    ) {
      client.address =
        updateClientDto.address
          ?.trim() || null;
    }

    try {
      return await this.clientRepository.save(
        client,
      );
    } catch (
      error: unknown
    ) {
      this.handleDatabaseError(
        error,
        'No se pudo actualizar el cliente.',
      );
    }
  }

  async remove(
    id: string,
  ): Promise<{
    message: string;
  }> {
    const client =
      await this.findOne(id);

    try {
      await this.clientRepository.remove(
        client,
      );

      return {
        message:
          'Cliente eliminado correctamente.',
      };
    } catch (
      error: unknown
    ) {
      if (
        error instanceof
        QueryFailedError
      ) {
        const databaseError =
          error.driverError as
            PostgreSqlError;

        /*
         * 23503:
         * violación de clave foránea.
         *
         * 23001:
         * violación de restricción.
         */
        if (
          databaseError.code ===
            '23503' ||
          databaseError.code ===
            '23001'
        ) {
          throw new ConflictException(
            'No se puede eliminar el cliente porque posee citas, cálculos o facturas relacionadas. El historial debe conservarse.',
          );
        }
      }

      throw new BadRequestException(
        'No se pudo eliminar el cliente.',
      );
    }
  }

  private normalizeEmail(
    email:
      | string
      | null
      | undefined,
  ): string | null {
    const normalized =
      email
        ?.trim()
        .toLowerCase();

    return normalized || null;
  }

  private handleDatabaseError(
    error: unknown,
    defaultMessage: string,
  ): never {
    if (
      error instanceof
      QueryFailedError
    ) {
      const databaseError =
        error.driverError as
          PostgreSqlError;

      /*
       * 23505:
       * valor único duplicado.
       */
      if (
        databaseError.code ===
        '23505'
      ) {
        throw new ConflictException(
          'El correo electrónico ya está registrado.',
        );
      }
    }

    throw new BadRequestException(
      defaultMessage,
    );
  }
}