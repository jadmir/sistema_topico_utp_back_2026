import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { SupabaseService } from '../supabase/supabase.service.js';
import { CrearEstablecimientoDto } from '../personas/dto/crear-establecimiento.dto.js'; 

@Injectable()
export class EstablecimientosService {
  constructor(
    private readonly supabaseService: SupabaseService,
  ) {}

  private get supabase() {
    return this.supabaseService.getClient();
  }

  async listar() {
    const { data, error } = await this.supabase
      .from('establecimientos')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async obtenerPorId(id: number) {
    const { data, error } = await this.supabase
      .from('establecimientos')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(error.message);
    }

    if (!data) {
      throw new NotFoundException(
        `No se encontró el establecimiento ${id}`,
      );
    }

    return data;
  }

  async crear(dto: CrearEstablecimientoDto) {
    const { data: existente } = await this.supabase
      .from('establecimientos')
      .select('id')
      .eq('nombre', dto.nombre)
      .maybeSingle();

    if (existente) {
      throw new BadRequestException(
        'Ya existe un establecimiento con ese nombre',
      );
    }

    const { data, error } = await this.supabase
      .from('establecimientos')
      .insert({
        nombre: dto.nombre,
        tipo: dto.tipo,
        direccion: dto.direccion,
        telefono: dto.telefono,
        activo: true,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      mensaje: 'Establecimiento creado correctamente',
      establecimiento: data,
    };
  }

  async actualizar(
    id: number,
    dto: Partial<CrearEstablecimientoDto>,
  ) {
    await this.obtenerPorId(id);

    const { data, error } = await this.supabase
      .from('establecimientos')
      .update(dto)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async desactivar(id: number) {
    await this.obtenerPorId(id);

    const { data, error } = await this.supabase
      .from('establecimientos')
      .update({
        activo: false,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      mensaje: 'Establecimiento desactivado correctamente',
      establecimiento: data,
    };
  }
}