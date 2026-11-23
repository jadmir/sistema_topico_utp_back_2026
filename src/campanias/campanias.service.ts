import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { SupabaseService } from '../supabase/supabase.service.js';
import { CrearCampaniaDto } from '../personas/dto/crear-campania.dto.js'; 

@Injectable()
export class CampaniasService {
  constructor(
    private readonly supabaseService: SupabaseService,
  ) {}

  private get supabase() {
    return this.supabaseService.getClient();
  }

  async listar() {
    const { data, error } = await this.supabase
      .from('campanias')
      .select('*')
      .order('fecha_inicio', { ascending: false });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async obtenerPorId(id: number) {
    const { data, error } = await this.supabase
      .from('campanias')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(error.message);
    }

    if (!data) {
      throw new NotFoundException(
        `No se encontró la campaña ${id}`,
      );
    }

    return data;
  }

  async crear(dto: CrearCampaniaDto) {
    if (
      dto.fecha_fin &&
      new Date(dto.fecha_fin) < new Date(dto.fecha_inicio)
    ) {
      throw new BadRequestException(
        'La fecha de fin no puede ser anterior a la fecha de inicio',
      );
    }

    const { data, error } = await this.supabase
      .from('campanias')
      .insert({
        nombre: dto.nombre,
        tipo: dto.tipo,
        descripcion: dto.descripcion ?? null,
        fecha_inicio: dto.fecha_inicio,
        fecha_fin: dto.fecha_fin ?? null,
        lugar: dto.lugar ?? null,
        responsable: dto.responsable ?? null,
        estado: dto.estado ?? 'PLANIFICADA',
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      mensaje: 'Campaña creada correctamente',
      campania: data,
    };
  }

  async actualizar(
    id: number,
    dto: Partial<CrearCampaniaDto>,
  ) {
    await this.obtenerPorId(id);

    if (
      dto.fecha_inicio &&
      dto.fecha_fin &&
      new Date(dto.fecha_fin) < new Date(dto.fecha_inicio)
    ) {
      throw new BadRequestException(
        'La fecha de fin no puede ser anterior a la fecha de inicio',
      );
    }

    const { data, error } = await this.supabase
      .from('campanias')
      .update(dto)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async cancelar(id: number) {
    await this.obtenerPorId(id);

    const { data, error } = await this.supabase
      .from('campanias')
      .update({
        estado: 'CANCELADA',
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      mensaje: 'Campaña cancelada correctamente',
      campania: data,
    };
  }
}