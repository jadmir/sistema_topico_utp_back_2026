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

import { ParticipacionesCampaniaService } from './participaciones-campania.service.js';
import { CrearParticipacionCampaniaDto } from '../personas/dto/crear-participacion-campania.dto.js'; 

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { Permissions } from '../auth/decorators/permissions.decorator.js';

@Controller('participaciones-campania')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ParticipacionesCampaniaController {
  constructor(
    private readonly participacionesService: ParticipacionesCampaniaService,
  ) {}

  @Get()
  @Permissions('PARTICIPACIONES_CAMPAÑA:VER')
  listar() {
    return this.participacionesService.listar();
  }

  @Get('campania/:campaniaId')
  @Permissions('PARTICIPACIONES_CAMPAÑA:VER')
  listarPorCampania(
    @Param('campaniaId', ParseIntPipe) campaniaId: number,
  ) {
    return this.participacionesService.listarPorCampania(campaniaId);
  }

  @Get('persona/:personaId')
  @Permissions('PARTICIPACIONES_CAMPAÑA:VER')
  listarPorPersona(
    @Param('personaId', ParseIntPipe) personaId: number,
  ) {
    return this.participacionesService.listarPorPersona(personaId);
  }

  @Get(':id')
  @Permissions('PARTICIPACIONES_CAMPAÑA:VER')
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.participacionesService.obtenerPorId(id);
  }

  @Post()
  @Permissions('PARTICIPACIONES_CAMPAÑA:CREAR')
  crear(@Body() dto: CrearParticipacionCampaniaDto) {
    return this.participacionesService.crear(dto);
  }

  @Patch(':id')
  @Permissions('PARTICIPACIONES_CAMPAÑA:EDITAR')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CrearParticipacionCampaniaDto>,
  ) {
    return this.participacionesService.actualizar(id, dto);
  }
}