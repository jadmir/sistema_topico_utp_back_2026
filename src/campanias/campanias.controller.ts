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

import { CampaniasService } from './campanias.service.js';
import { CrearCampaniaDto } from '../personas/dto/crear-campania.dto.js'; 

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { Permissions } from '../auth/decorators/permissions.decorator.js';

@Controller('campanias')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CampaniasController {
  constructor(
    private readonly campaniasService: CampaniasService,
  ) {}

  @Get()
  @Permissions('CAMPAÑAS:VER')
  listar() {
    return this.campaniasService.listar();
  }

  @Get(':id')
  @Permissions('CAMPAÑAS:VER')
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.campaniasService.obtenerPorId(id);
  }

  @Post()
  @Permissions('CAMPAÑAS:CREAR')
  crear(@Body() dto: CrearCampaniaDto) {
    return this.campaniasService.crear(dto);
  }

  @Patch(':id')
  @Permissions('CAMPAÑAS:EDITAR')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CrearCampaniaDto>,
  ) {
    return this.campaniasService.actualizar(id, dto);
  }

  @Patch(':id/cancelar')
  @Permissions('CAMPAÑAS:EDITAR')
  cancelar(@Param('id', ParseIntPipe) id: number) {
    return this.campaniasService.cancelar(id);
  }
}