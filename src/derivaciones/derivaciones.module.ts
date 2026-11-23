import { Module } from '@nestjs/common';
import { DerivacionesController } from './derivaciones.controller.js';
import { DerivacionesService } from './derivaciones.service.js';

@Module({
  controllers: [DerivacionesController],
  providers: [DerivacionesService]
})
export class DerivacionesModule {}
