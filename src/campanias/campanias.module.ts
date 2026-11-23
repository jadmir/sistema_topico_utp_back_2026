import { Module } from '@nestjs/common';
import { CampaniasController } from './campanias.controller.js';
import { CampaniasService } from './campanias.service.js';

@Module({
  controllers: [CampaniasController],
  providers: [CampaniasService]
})
export class CampaniasModule {}
