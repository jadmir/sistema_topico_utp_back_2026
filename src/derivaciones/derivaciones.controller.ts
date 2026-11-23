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

import { DerivacionesService } from './derivaciones.service.js';
import { CrearDerivacionDto } from '../personas/dto/crear-derivacion.dto.js'; 

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { Permissions } from '../auth/decorators/permissions.decorator.js';

@Controller('derivaciones')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DerivacionesController {
  constructor(
    private readonly derivacionesService: DerivacionesService,
  ) {}

  @Get()
  @Permissions('DERIVACIONES:VER')
  listar() {
    return this.derivacionesService.listar();
  }

  @Get('atencion/:atencionId')
  @Permissions('DERIVACIONES:VER')
  listarPorAtencion(
    @Param('atencionId', ParseIntPipe) atencionId: number,
  ) {
    return this.derivacionesService.listarPorAtencion(atencionId);
  }

  @Get(':id')
  @Permissions('DERIVACIONES:VER')
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.derivacionesService.obtenerPorId(id);
  }

  @Post()
  @Permissions('DERIVACIONES:CREAR')
  crear(@Body() dto: CrearDerivacionDto) {
    return this.derivacionesService.crear(dto);
  }

  @Patch(':id')
  @Permissions('DERIVACIONES:EDITAR')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CrearDerivacionDto>,
  ) {
    return this.derivacionesService.actualizar(id, dto);
  }
}