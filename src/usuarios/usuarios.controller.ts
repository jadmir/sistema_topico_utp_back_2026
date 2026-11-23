import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { UsuariosService } from './usuarios.service.js';
import { CrearUsuarioDto } from '../personas/dto/crear-usuario.dto.js'; 
import { ActualizarUsuarioDto } from '../personas/dto/actualizar-usuario.dto.js'; 
import { Roles } from '../auth/decorators/roles.decorator.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';

import { UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMINISTRADOR')
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
  ) {}

  @Get()
  listar() {
    return this.usuariosService.listar();
  }

  @Get(':id')
  obtenerPorId(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.usuariosService.obtenerPorId(id);
  }

  @Post()
  crear(@Body() dto: CrearUsuarioDto) {
    return this.usuariosService.crear(dto);
  }

  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarUsuarioDto,
  ) {
    return this.usuariosService.actualizar(id, dto);
  }

  @Patch(':id/desactivar')
  desactivar(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.usuariosService.desactivar(id);
  }
}