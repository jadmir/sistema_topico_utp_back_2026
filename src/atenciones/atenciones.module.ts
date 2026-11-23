import { Module } from '@nestjs/common';
import { AtencionesController } from './atenciones.controller.js';
import { AtencionesService } from './atenciones.service.js';

@Module({
  controllers: [AtencionesController],
  providers: [AtencionesService]
})
export class AtencionesModule {}
