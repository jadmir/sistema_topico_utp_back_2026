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

import { AlergiasService } from './alergias.service.js';
import { CrearAlergiaDto } from '../personas/dto/crear-alergia.dto.js'; 

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { Permissions } from '../auth/decorators/permissions.decorator.js';

@Controller('alergias')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AlergiasController {
  constructor(
    private readonly alergiasService: AlergiasService,
  ) {}

  @Get('persona/:personaId')
  @Permissions('ALERGIAS:VER')
  obtenerPorPersona(
    @Param('personaId', ParseIntPipe) personaId: number,
  ) {
    return this.alergiasService.obtenerPorPersona(personaId);
  }

  @Get(':id')
  @Permissions('ALERGIAS:VER')
  obtenerPorId(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.alergiasService.obtenerPorId(id);
  }

  @Post()
  @Permissions('ALERGIAS:CREAR')
  crear(
    @Body() dto: CrearAlergiaDto,
  ) {
    return this.alergiasService.crear(dto);
  }

  @Patch(':id')
  @Permissions('ALERGIAS:EDITAR')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CrearAlergiaDto>,
  ) {
    return this.alergiasService.actualizar(id, dto);
  }

  @Patch(':id/desactivar')
  @Permissions('ALERGIAS:EDITAR')
  desactivar(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.alergiasService.eliminar(id);
  }
}