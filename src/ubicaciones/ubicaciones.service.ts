import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { SupabaseService } from '../supabase/supabase.service.js';

@Injectable()
export class UbicacionesService {
  constructor(
    private readonly supabaseService: SupabaseService,
  ) {}

  private get supabase() {
    return this.supabaseService.getClient();
  }

  async obtenerTodas() {
    const { data, error } = await this.supabase
      .from('ubicaciones')
      .select(`
        id,
        nombre,
        tipo,
        descripcion,
        activo
      `)
      .order('nombre', { ascending: true });

    if (error) {
      throw new BadRequestException(
        `Error obteniendo ubicaciones: ${error.message}`,
      );
    }

    return data;
  }

  async obtenerPorId(id: number) {
    const { data, error } = await this.supabase
      .from('ubicaciones')
      .select(`
        id,
        nombre,
        tipo,
        descripcion,
        activo
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(
        `Error buscando ubicación: ${error.message}`,
      );
    }

    if (!data) {
      throw new NotFoundException(
        `No se encontró la ubicación ${id}.`,
      );
    }

    return data;
  }
}