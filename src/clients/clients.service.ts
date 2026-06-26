import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async create(createClientDto: CreateClientDto): Promise<Client> {
    if (createClientDto.email) {
      const existingClient = await this.clientRepository.findOne({
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

    const client = this.clientRepository.create(createClientDto);

    return await this.clientRepository.save(client);
  }

  async findAll(): Promise<Client[]> {
    return await this.clientRepository.find();
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.clientRepository.findOne({
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
      const existingClient = await this.clientRepository.findOne({
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

    Object.assign(client, updateClientDto);

    return await this.clientRepository.save(client);
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