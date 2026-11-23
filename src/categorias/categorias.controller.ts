import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';

import { CategoriasService } from './categorias.service.js';

@Controller('categorias')
export class CategoriasController {
  constructor(
    private readonly categoriasService: CategoriasService,
  ) {}

  @Get()
  async obtenerTodas() {
    return this.categoriasService.obtenerTodas();
  }

  @Get(':id')
  async obtenerPorId(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.categoriasService.obtenerPorId(id);
  }
}