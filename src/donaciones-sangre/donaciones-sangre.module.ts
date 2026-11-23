import { Module } from '@nestjs/common';
import { DonacionesSangreController } from './donaciones-sangre.controller.js';
import { DonacionesSangreService } from './donaciones-sangre.service.js';

@Module({
  controllers: [DonacionesSangreController],
  providers: [DonacionesSangreService]
})
export class DonacionesSangreModule {}
