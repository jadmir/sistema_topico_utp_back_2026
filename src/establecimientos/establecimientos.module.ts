import { Module } from '@nestjs/common';
import { EstablecimientosController } from './establecimientos.controller.js';
import { EstablecimientosService } from './establecimientos.service.js';

@Module({
  controllers: [EstablecimientosController],
  providers: [EstablecimientosService]
})
export class EstablecimientosModule {}
