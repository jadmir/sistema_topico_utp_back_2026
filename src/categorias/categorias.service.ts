import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { SupabaseService } from '../supabase/supabase.service.js';

@Injectable()
export class CategoriasService {
  constructor(
    private readonly supabaseService: SupabaseService,
  ) {}

  private get supabase() {
    return this.supabaseService.getClient();
  }

  async obtenerTodas() {
    const { data, error } = await this.supabase
      .from('categorias')
      .select(`
        id,
        nombre,
        descripcion,
        activo
      `)
      .order('nombre', { ascending: true });

    if (error) {
      throw new BadRequestException(
        `Error obteniendo categorías: ${error.message}`,
      );
    }

    return data;
  }

  async obtenerPorId(id: number) {
    const { data, error } = await this.supabase
      .from('categorias')
      .select(`
        id,
        nombre,
        descripcion,
        activo
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(
        `Error buscando categoría: ${error.message}`,
      );
    }

    if (!data) {
      throw new NotFoundException(
        `No se encontró la categoría ${id}.`,
      );
    }

    return data;
  }
}