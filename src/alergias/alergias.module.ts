import { Module } from '@nestjs/common';
import { AlergiasController } from './alergias.controller.js';
import { AlergiasService } from './alergias.service.js';

@Module({
  controllers: [AlergiasController],
  providers: [AlergiasService]
})
export class AlergiasModule {}
