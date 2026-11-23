import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { SupabaseService } from '../supabase/supabase.service.js';

import { CrearMarcaDto } from '../personas/dto/crear-marca.dto.js'; 
import { ActualizarMarcaDto } from '../personas/dto/actualizar-marca.dto.js'; 

@Injectable()
export class MarcasService {
  constructor(
    private readonly supabaseService: SupabaseService,
  ) {}

  private get supabase() {
    return this.supabaseService.getClient();
  }

  async obtenerTodas() {
    const { data, error } = await this.supabase
      .from('marcas')
      .select(`
        id,
        nombre,
        activo
      `)
      .order('nombre', { ascending: true });

    if (error) {
      throw new BadRequestException(
        `Error obteniendo marcas: ${error.message}`,
      );
    }

    return data;
  }

  async obtenerPorId(id: number) {
    const { data, error } = await this.supabase
      .from('marcas')
      .select(`
        id,
        nombre,
        activo
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(
        `Error buscando marca: ${error.message}`,
      );
    }

    if (!data) {
      throw new NotFoundException(
        `No se encontró la marca ${id}.`,
      );
    }

    return data;
  }

  async crear(dto: CrearMarcaDto) {
    const { data: existente } = await this.supabase
      .from('marcas')
      .select('id')
      .eq('nombre', dto.nombre)
      .maybeSingle();

    if (existente) {
      throw new BadRequestException(
        `Ya existe una marca llamada "${dto.nombre}".`,
      );
    }

    const { data, error } = await this.supabase
      .from('marcas')
      .insert({
        nombre: dto.nombre,
        activo: true,
      })
      .select(`
        id,
        nombre,
        activo
      `)
      .single();

    if (error) {
      throw new BadRequestException(
        `Error creando marca: ${error.message}`,
      );
    }

    return data;
  }

  async actualizar(
    id: number,
    dto: ActualizarMarcaDto,
  ) {
    await this.obtenerPorId(id);

    if (dto.nombre) {
      const { data: existente } = await this.supabase
        .from('marcas')
        .select('id')
        .eq('nombre', dto.nombre)
        .neq('id', id)
        .maybeSingle();

      if (existente) {
        throw new BadRequestException(
          `Ya existe otra marca llamada "${dto.nombre}".`,
        );
      }
    }

    const { data, error } = await this.supabase
      .from('marcas')
      .update(dto)
      .eq('id', id)
      .select(`
        id,
        nombre,
        activo
      `)
      .single();

    if (error) {
      throw new BadRequestException(
        `Error actualizando marca: ${error.message}`,
      );
    }

    return data;
  }
}