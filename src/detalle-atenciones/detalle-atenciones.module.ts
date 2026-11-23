import { Module } from '@nestjs/common';
import { DetalleAtencionesController } from './detalle-atenciones.controller.js';
import { DetalleAtencionesService } from './detalle-atenciones.service.js';

@Module({
  controllers: [DetalleAtencionesController],
  providers: [DetalleAtencionesService]
})
export class DetalleAtencionesModule {}
