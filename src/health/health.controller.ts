import {
  Controller,
  Get,
} from '@nestjs/common';

import { SupabaseService } from '../supabase/supabase.service.js'; 

@Controller('health')
export class HealthController {

  constructor(
    private readonly supabaseService: SupabaseService,
  ) {}

  @Get()
  async check() {

    const supabase =
      this.supabaseService.getClient();

    const { error } = await supabase
      .from('personas')
      .select('id')
      .limit(1);

    if (error) {
      return {
        ok: false,
        mensaje: 'Error conectando con Supabase',
        error: error.message,
      };
    }

    return {
      ok: true,
      mensaje: 'Backend NestJS conectado correctamente con Supabase',
      database: 'Supabase PostgreSQL',
    };
  }
}