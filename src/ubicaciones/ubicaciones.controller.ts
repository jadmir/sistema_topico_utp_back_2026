import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { UbicacionesService } from './ubicaciones.service.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { Permissions } from '../auth/decorators/permissions.decorator.js';

@Controller('ubicaciones')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UbicacionesController {
  constructor(
    private readonly ubicacionesService: UbicacionesService,
  ) {}

  @Get()
  @Permissions('UBICACIONES:VER')
  listar() {
    return this.ubicacionesService.obtenerTodas();
  }

  @Get(':id')
  @Permissions('UBICACIONES:VER')
  obtenerPorId(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ubicacionesService.obtenerPorId(id);
  }
}