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

import { ProductosService } from './productos.service.js';
import { CrearProductoDto } from '../personas/dto/crear-producto.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { Permissions } from '../auth/decorators/permissions.decorator.js';

@Controller('productos')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProductosController {
  constructor(
    private readonly productosService: ProductosService,
  ) {}

  @Get()
  @Permissions('PRODUCTOS:VER')
  listar() {
    return this.productosService.obtenerTodos();
  }

  @Get('codigo/:codigo')
  @Permissions('PRODUCTOS:VER')
  obtenerPorCodigo(@Param('codigo') codigo: string) {
    return this.productosService.obtenerPorCodigo(codigo);
  }

  @Get(':id')
  @Permissions('PRODUCTOS:VER')
  obtenerPorId(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.productosService.obtenerPorId(id);
  }

  @Post()
  @Permissions('PRODUCTOS:CREAR')
  crear(@Body() dto: CrearProductoDto) {
    return this.productosService.crear(dto);
  }

  @Patch(':id')
  @Permissions('PRODUCTOS:EDITAR')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CrearProductoDto>,
  ) {
    return this.productosService.actualizar(id, dto);
  }
}