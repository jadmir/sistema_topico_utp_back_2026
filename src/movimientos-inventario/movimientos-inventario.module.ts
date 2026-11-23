import { Module } from '@nestjs/common';

import {
  MovimientosInventarioController,
} from './movimientos-inventario.controller.js';

import {
  MovimientosInventarioService,
} from './movimientos-inventario.service.js';

@Module({
  controllers: [
    MovimientosInventarioController,
  ],
  providers: [
    MovimientosInventarioService,
  ],
})
export class MovimientosInventarioModule {}