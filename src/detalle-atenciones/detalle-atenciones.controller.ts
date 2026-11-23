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

import { DetalleAtencionesService } from './detalle-atenciones.service.js';
import { CrearDetalleAtencionDto } from '../personas/dto/crear-detalle-atencion.dto.js'; 

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { Permissions } from '../auth/decorators/permissions.decorator.js';

@Controller('detalle-atenciones')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DetalleAtencionesController {
  constructor(
    private readonly detalleAtencionesService: DetalleAtencionesService,
  ) {}

  // ==========================================
  // LISTAR TODOS
  // ==========================================
  @Get()
  @Permissions('DETALLE_ATENCIONES:VER')
  listar() {
    return this.detalleAtencionesService.listar();
  }

  // ==========================================
  // LISTAR POR ATENCIÓN
  // ==========================================
  @Get('atencion/:atencionId')
  @Permissions('DETALLE_ATENCIONES:VER')
  listarPorAtencion(
    @Param('atencionId', ParseIntPipe) atencionId: number,
  ) {
    return this.detalleAtencionesService.listarPorAtencion(atencionId);
  }

  // ==========================================
  // OBTENER POR ID
  // ==========================================
  @Get(':id')
  @Permissions('DETALLE_ATENCIONES:VER')
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.detalleAtencionesService.obtenerPorId(id);
  }

  // ==========================================
  // CREAR DETALLE
  // ==========================================
  @Post()
  @Permissions('DETALLE_ATENCIONES:CREAR')
  crear(@Body() dto: CrearDetalleAtencionDto) {
    return this.detalleAtencionesService.crear(dto);
  }

  // ==========================================
  // ACTUALIZAR OBSERVACIONES
  // ==========================================
  @Patch(':id')
  @Permissions('DETALLE_ATENCIONES:EDITAR')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body('observaciones') observaciones?: string,
  ) {
    return this.detalleAtencionesService.actualizar(
      id,
      observaciones,
    );
  }
}