import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { PersonasService } from './personas.service.js';
import { CrearPersonaDto } from './dto/crear-persona.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { Permissions } from '../auth/decorators/permissions.decorator.js';

@Controller('personas')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PersonasController {
  constructor(
    private readonly personasService: PersonasService,
  ) {}

  @Get()
  @Permissions('PERSONAS:VER')
  listar() {
    return this.personasService.obtenerTodas();
  }

  @Get('dni/:dni')
  @Permissions('PERSONAS:VER')
  obtenerPorDni(
    @Param('dni') dni: string,
  ) {
    return this.personasService.obtenerPorDni(dni);
  }

  @Get(':id')
  @Permissions('PERSONAS:VER')
  obtenerPorId(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.personasService.obtenerPorId(id);
  }

  @Post()
  @Permissions('PERSONAS:CREAR')
  crear(
    @Body() dto: CrearPersonaDto,
  ) {
    return this.personasService.crear(dto);
  }

  @Patch(':id')
  @Permissions('PERSONAS:EDITAR')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CrearPersonaDto>,
  ) {
    return this.personasService.actualizar(id, dto);
  }
}