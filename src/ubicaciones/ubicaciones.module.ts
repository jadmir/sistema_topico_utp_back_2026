import { Module } from '@nestjs/common';
import { UbicacionesController } from './ubicaciones.controller.js';
import { UbicacionesService } from './ubicaciones.service.js';

@Module({
  controllers: [UbicacionesController],
  providers: [UbicacionesService]
})
export class UbicacionesModule {}
