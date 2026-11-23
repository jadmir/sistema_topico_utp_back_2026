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

import { MarcasService } from './marcas.service.js';
import { CrearMarcaDto } from '../personas/dto/crear-marca.dto.js'; 

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { Permissions } from '../auth/decorators/permissions.decorator.js';

@Controller('marcas')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class MarcasController {
  constructor(
    private readonly marcasService: MarcasService,
  ) {}

  @Get()
  @Permissions('MARCAS:VER')
  listar() {
    return this.marcasService.obtenerTodas();
  }

  @Get(':id')
  @Permissions('MARCAS:VER')
  obtenerPorId(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.marcasService.obtenerPorId(id);
  }

  @Post()
  @Permissions('MARCAS:CREAR')
  crear(
    @Body() dto: CrearMarcaDto,
  ) {
    return this.marcasService.crear(dto);
  }

  @Patch(':id')
  @Permissions('MARCAS:EDITAR')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CrearMarcaDto>,
  ) {
    return this.marcasService.actualizar(id, dto);
  }
}