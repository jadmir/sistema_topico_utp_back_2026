import { Module } from '@nestjs/common';
import { ParticipacionesCampaniaController } from './participaciones-campania.controller.js';
import { ParticipacionesCampaniaService } from './participaciones-campania.service.js';

@Module({
  controllers: [ParticipacionesCampaniaController],
  providers: [ParticipacionesCampaniaService]
})
export class ParticipacionesCampaniaModule {}
