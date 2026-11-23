
import { Module } from '@nestjs/common';
import { CargasController } from './cargas.controller.js';
import { CargasService } from './cargas.service.js';
import { SupabaseModule } from '../supabase/supabase.module.js';

@Module({
  imports: [SupabaseModule],
  controllers: [CargasController],
  providers: [CargasService],
  exports: [CargasService],
})
export class CargasModule {}
