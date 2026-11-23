import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';

import { AlumnosService } from './alumnos.service.js';

@Controller('alumnos')
export class AlumnosController {
  constructor(
    private readonly alumnosService: AlumnosService,
  ) {}

  @Get()
  async obtenerTodos() {
    return this.alumnosService.obtenerTodos();
  }

  @Get('dni/:dni/resumen')
  async obtenerResumenPorDni(
    @Param('dni') dni: string,
  ) {
    return this.alumnosService.obtenerResumenPorDni(dni);
  }

  @Get('dni/:dni')
  async obtenerPorDni(
    @Param('dni') dni: string,
  ) {
    return this.alumnosService.obtenerPorDni(dni);
  }

  @Get('codigo/:codigo')
  async obtenerPorCodigo(
    @Param('codigo') codigo: string,
  ) {
    return this.alumnosService.obtenerPorCodigo(codigo);
  }

  @Get('persona/:personaId')
  async obtenerPorPersona(
    @Param('personaId', ParseIntPipe) personaId: number,
  ) {
    return this.alumnosService.obtenerPorPersona(personaId);
  }

  @Get(':id')
  async obtenerPorId(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.alumnosService.obtenerPorId(id);
  }
}