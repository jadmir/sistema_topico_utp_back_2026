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

import { AtencionesService } from './atenciones.service.js';
import { CrearAtencionDto } from '../personas/dto/crear-atencion.dto.js'; 

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { Permissions } from '../auth/decorators/permissions.decorator.js';

@Controller('atenciones')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AtencionesController {
  constructor(
    private readonly atencionesService: AtencionesService,
  ) {}

  @Get()
  @Permissions('ATENCIONES:VER')
  listar() {
    return this.atencionesService.obtenerTodas();
  }

  @Get('persona/:personaId')
  @Permissions('ATENCIONES:VER')
  obtenerPorPersona(
    @Param('personaId', ParseIntPipe) personaId: number,
  ) {
    return this.atencionesService.obtenerPorPersona(personaId);
  }

  @Get(':id')
  @Permissions('ATENCIONES:VER')
  obtenerPorId(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.atencionesService.obtenerPorId(id);
  }

  @Post()
  @Permissions('ATENCIONES:CREAR')
  crear(
    @Body() dto: CrearAtencionDto,
  ) {
    return this.atencionesService.crear(dto);
  }

  @Patch(':id')
  @Permissions('ATENCIONES:EDITAR')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CrearAtencionDto>,
  ) {
    return this.atencionesService.actualizar(id, dto);
  }

  @Patch(':id/cerrar')
  @Permissions('ATENCIONES:EDITAR')
  cerrar(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.atencionesService.cerrar(id);
  }
}