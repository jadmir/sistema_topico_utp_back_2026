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

import { LotesService } from './lotes.service.js';
import { CrearLoteDto } from '../personas/dto/crear-lote.dto.js'; 

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { Permissions } from '../auth/decorators/permissions.decorator.js';

@Controller('lotes')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class LotesController {
  constructor(
    private readonly lotesService: LotesService,
  ) {}

  @Get()
  @Permissions('LOTES:VER')
  listar() {
    return this.lotesService.obtenerTodos();
  }

  @Get('producto/:productoId')
  @Permissions('LOTES:VER')
  obtenerPorProducto(
    @Param('productoId', ParseIntPipe) productoId: number,
  ) {
    return this.lotesService.obtenerPorProducto(productoId);
  }

  @Get(':id')
  @Permissions('LOTES:VER')
  obtenerPorId(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.lotesService.obtenerPorId(id);
  }

  @Post()
  @Permissions('LOTES:CREAR')
  crear(
    @Body() dto: CrearLoteDto,
  ) {
    return this.lotesService.crear(dto);
  }

  @Patch(':id')
  @Permissions('LOTES:EDITAR')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CrearLoteDto>,
  ) {
    return this.lotesService.actualizar(id, dto);
  }
}