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

import { EstablecimientosService } from './establecimientos.service.js';
import { CrearEstablecimientoDto } from '../personas/dto/crear-establecimiento.dto.js'; 

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { Permissions } from '../auth/decorators/permissions.decorator.js';

@Controller('establecimientos')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EstablecimientosController {
  constructor(
    private readonly establecimientosService: EstablecimientosService,
  ) {}

  @Get()
  @Permissions('ESTABLECIMIENTOS:VER')
  listar() {
    return this.establecimientosService.listar();
  }

  @Get(':id')
  @Permissions('ESTABLECIMIENTOS:VER')
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.establecimientosService.obtenerPorId(id);
  }

  @Post()
  @Permissions('ESTABLECIMIENTOS:CREAR')
  crear(@Body() dto: CrearEstablecimientoDto) {
    return this.establecimientosService.crear(dto);
  }

  @Patch(':id')
  @Permissions('ESTABLECIMIENTOS:EDITAR')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CrearEstablecimientoDto>,
  ) {
    return this.establecimientosService.actualizar(id, dto);
  }

  @Patch(':id/desactivar')
  @Permissions('ESTABLECIMIENTOS:EDITAR')
  desactivar(@Param('id', ParseIntPipe) id: number) {
    return this.establecimientosService.desactivar(id);
  }
}