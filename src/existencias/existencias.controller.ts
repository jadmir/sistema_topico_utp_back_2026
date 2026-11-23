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

import { ExistenciasService } from './existencias.service.js';
import { CrearExistenciaDto } from '../personas/dto/crear-existencia.dto.js'; 

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { Permissions } from '../auth/decorators/permissions.decorator.js';

@Controller('existencias')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ExistenciasController {
  constructor(
    private readonly existenciasService: ExistenciasService,
  ) {}

  @Get()
  @Permissions('EXISTENCIAS:VER')
  listar() {
    return this.existenciasService.obtenerTodas();
  }

  @Get('lote/:loteId')
  @Permissions('EXISTENCIAS:VER')
  obtenerPorLote(
    @Param('loteId', ParseIntPipe) loteId: number,
  ) {
    return this.existenciasService.obtenerPorLote(loteId);
  }

  @Get('ubicacion/:ubicacionId')
  @Permissions('EXISTENCIAS:VER')
  obtenerPorUbicacion(
    @Param('ubicacionId', ParseIntPipe) ubicacionId: number,
  ) {
    return this.existenciasService.obtenerPorUbicacion(ubicacionId);
  }

  @Get(':id')
  @Permissions('EXISTENCIAS:VER')
  obtenerPorId(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.existenciasService.obtenerPorId(id);
  }

  @Post()
  @Permissions('EXISTENCIAS:CREAR')
  crear(
    @Body() dto: CrearExistenciaDto,
  ) {
    return this.existenciasService.crear(dto);
  }

  @Patch(':id')
  @Permissions('EXISTENCIAS:EDITAR')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CrearExistenciaDto>,
  ) {
    return this.existenciasService.actualizar(id, dto);
  }
}