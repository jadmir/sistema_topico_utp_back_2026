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

import { DonacionesSangreService } from './donaciones-sangre.service.js';
import { CrearDonacionSangreDto } from '../personas/dto/crear-donacion-sangre.dto.js'; 

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { Permissions } from '../auth/decorators/permissions.decorator.js';

@Controller('donaciones-sangre')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DonacionesSangreController {
  constructor(
    private readonly donacionesService: DonacionesSangreService,
  ) {}

  @Get()
  @Permissions('DONACIONES_SANGRE:VER')
  listar() {
    return this.donacionesService.listar();
  }

  @Get('participacion/:participacionId')
  @Permissions('DONACIONES_SANGRE:VER')
  obtenerPorParticipacion(
    @Param('participacionId', ParseIntPipe) participacionId: number,
  ) {
    return this.donacionesService.obtenerPorParticipacion(
      participacionId,
    );
  }

  @Get(':id')
  @Permissions('DONACIONES_SANGRE:VER')
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.donacionesService.obtenerPorId(id);
  }

  @Post()
  @Permissions('DONACIONES_SANGRE:CREAR')
  crear(@Body() dto: CrearDonacionSangreDto) {
    return this.donacionesService.crear(dto);
  }

  @Patch(':id')
  @Permissions('DONACIONES_SANGRE:EDITAR')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CrearDonacionSangreDto>,
  ) {
    return this.donacionesService.actualizar(id, dto);
  }
}