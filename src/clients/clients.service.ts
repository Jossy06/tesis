import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './entities/client.entity';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async create(
    createClientDto: CreateClientDto,
  ): Promise<Client> {
    if (createClientDto.email) {
      const existingClient =
        await this.clientRepository.findOne({
          where: {
            email: createClientDto.email,
          },
        });

      if (existingClient) {
        throw new ConflictException(
          'El correo ya está registrado',
        );
      }
    }

    const client =
      this.clientRepository.create(createClientDto);

    return this.clientRepository.save(client);
  }

  async findAll(): Promise<Client[]> {
    return this.clientRepository.find({
      order: {
        created_at: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<Client> {
    const client =
      await this.clientRepository.findOne({
        where: { id },
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
    updateClientDto: UpdateClientDto,
  ): Promise<Client> {
    const client = await this.findOne(id);

    if (
      updateClientDto.email &&
      updateClientDto.email !== client.email
    ) {
      const existingClient =
        await this.clientRepository.findOne({
          where: {
            email: updateClientDto.email,
          },
        });

      if (existingClient) {
        throw new ConflictException(
          'El correo ya está registrado',
        );
      }
    }

    const updatedClient =
      this.clientRepository.merge(
        client,
        updateClientDto,
      );

    return this.clientRepository.save(updatedClient);
  }

  async remove(
    id: string,
  ): Promise<{ message: string }> {
    const client = await this.findOne(id);

    await this.clientRepository.remove(client);

    return {
      message: 'Cliente eliminado correctamente',
    };
  }
}