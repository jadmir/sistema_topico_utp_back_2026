import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { TriajesService } from './triajes.service.js';

import { CrearTriajeDto } from '../personas/dto/crear-triaje.dto.js'; 
import { ActualizarTriajeDto } from '../personas/dto/actualizar-triaje.dto.js'; 

@Controller('triajes')
export class TriajesController {
  constructor(
    private readonly triajesService: TriajesService,
  ) {}

  @Get(':id')
  async obtenerPorId(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.triajesService.obtenerPorId(id);
  }

  @Get('atencion/:atencionId')
  async obtenerPorAtencion(
    @Param('atencionId', ParseIntPipe) atencionId: number,
  ) {
    return this.triajesService.obtenerPorAtencion(
      atencionId,
    );
  }

  @Post()
  async crear(
    @Body() dto: CrearTriajeDto,
  ) {
    return this.triajesService.crear(dto);
  }

  @Patch(':id')
  async actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarTriajeDto,
  ) {
    return this.triajesService.actualizar(id, dto);
  }
}