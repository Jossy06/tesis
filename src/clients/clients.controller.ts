import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './entities/client.entity';

@ApiTags('Clients')
@Controller('clients')
export class ClientsController {
  constructor(
    private readonly clientsService: ClientsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Crear cliente',
  })
  @ApiCreatedResponse({
    description: 'Cliente creado correctamente',
    type: Client,
  })
  @ApiConflictResponse({
    description: 'El correo ya está registrado',
  })
  @ApiBadRequestResponse({
    description: 'Datos enviados incorrectos',
  })
  create(
    @Body() createClientDto: CreateClientDto,
  ): Promise<Client> {
    return this.clientsService.create(createClientDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar clientes',
  })
  @ApiOkResponse({
    description: 'Lista de clientes obtenida correctamente',
    type: Client,
    isArray: true,
  })
  findAll(): Promise<Client[]> {
    return this.clientsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener cliente por ID',
  })
  @ApiOkResponse({
    description: 'Cliente encontrado',
    type: Client,
  })
  @ApiBadRequestResponse({
    description: 'El ID no tiene un formato UUID válido',
  })
  @ApiNotFoundResponse({
    description: 'Cliente no encontrado',
  })
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' }))
    id: string,
  ): Promise<Client> {
    return this.clientsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar cliente',
  })
  @ApiOkResponse({
    description: 'Cliente actualizado correctamente',
    type: Client,
  })
  @ApiBadRequestResponse({
    description: 'El ID o los datos enviados son incorrectos',
  })
  @ApiNotFoundResponse({
    description: 'Cliente no encontrado',
  })
  @ApiConflictResponse({
    description: 'El correo ya está registrado',
  })
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' }))
    id: string,
    @Body() updateClientDto: UpdateClientDto,
  ): Promise<Client> {
    return this.clientsService.update(
      id,
      updateClientDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar cliente',
  })
  @ApiOkResponse({
    description: 'Cliente eliminado correctamente',
    schema: {
      example: {
        message: 'Cliente eliminado correctamente',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'El ID no tiene un formato UUID válido',
  })
  @ApiNotFoundResponse({
    description: 'Cliente no encontrado',
  })
  remove(
    @Param('id', new ParseUUIDPipe({ version: '4' }))
    id: string,
  ): Promise<{ message: string }> {
    return this.clientsService.remove(id);
  }
}