import { Module } from '@nestjs/common';
import { TriajesController } from './triajes.controller.js';
import { TriajesService } from './triajes.service.js';

@Module({
  controllers: [TriajesController],
  providers: [TriajesService]
})
export class TriajesModule {}
