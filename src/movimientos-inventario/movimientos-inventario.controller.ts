import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';

import { MovimientosInventarioService } from './movimientos-inventario.service.js';
import { CrearMovimientoDto } from '../personas/dto/crear-movimiento.dto.js'; 

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { Permissions } from '../auth/decorators/permissions.decorator.js';

@Controller('movimientos-inventario')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class MovimientosInventarioController {
  constructor(
    private readonly movimientosService: MovimientosInventarioService,
  ) {}

  @Get()
  @Permissions('MOVIMIENTOS_INVENTARIO:VER')
  listar() {
    return this.movimientosService.obtenerTodos();
  }

  @Get(':id')
  @Permissions('MOVIMIENTOS_INVENTARIO:VER')
  obtenerPorId(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.movimientosService.obtenerPorId(id);
  }

  @Post()
  @Permissions('MOVIMIENTOS_INVENTARIO:CREAR')
  crear(
    @Body() dto: CrearMovimientoDto,
  ) {
    return this.movimientosService.crear(dto);
  }
}