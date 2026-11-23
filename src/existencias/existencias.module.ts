import { Module } from '@nestjs/common';
import { ExistenciasController } from './existencias.controller.js';
import { ExistenciasService } from './existencias.service.js';

@Module({
  controllers: [ExistenciasController],
  providers: [ExistenciasService]
})
export class ExistenciasModule {}
