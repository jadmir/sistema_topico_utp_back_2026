import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { SupabaseService } from '../supabase/supabase.service.js';

import { CrearTriajeDto } from '../personas/dto/crear-triaje.dto.js'; 
import { ActualizarTriajeDto } from '../personas/dto/actualizar-triaje.dto.js'; 

@Injectable()
export class TriajesService {
  constructor(
    private readonly supabaseService: SupabaseService,
  ) {}

  private get supabase() {
    return this.supabaseService.getClient();
  }

  async obtenerPorId(id: number) {
    const { data, error } = await this.supabase
      .from('triajes')
      .select(`
        id,
        atencion_id,
        frecuencia_cardiaca,
        frecuencia_respiratoria,
        temperatura,
        presion_arterial,
        saturacion_oxigeno,
        peso,
        talla,
        alergia_farmacos,
        alergia_alimentos,
        clasificacion,
        observaciones,
        created_at
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(
        `Error buscando triaje: ${error.message}`,
      );
    }

    if (!data) {
      throw new NotFoundException(
        `No se encontró el triaje con ID ${id}.`,
      );
    }

    return data;
  }

  async obtenerPorAtencion(atencionId: number) {
    const { data, error } = await this.supabase
      .from('triajes')
      .select(`
        id,
        atencion_id,
        frecuencia_cardiaca,
        frecuencia_respiratoria,
        temperatura,
        presion_arterial,
        saturacion_oxigeno,
        peso,
        talla,
        alergia_farmacos,
        alergia_alimentos,
        clasificacion,
        observaciones,
        created_at
      `)
      .eq('atencion_id', atencionId)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(
        `Error buscando triaje: ${error.message}`,
      );
    }

    return data;
  }

  async crear(dto: CrearTriajeDto) {
    const { data: atencion, error: atencionError } =
      await this.supabase
        .from('atenciones')
        .select('id')
        .eq('id', dto.atencion_id)
        .maybeSingle();

    if (atencionError) {
      throw new BadRequestException(
        `Error verificando atención: ${atencionError.message}`,
      );
    }

    if (!atencion) {
      throw new BadRequestException(
        `La atención ${dto.atencion_id} no existe.`,
      );
    }

    const { data: triajeExistente } =
      await this.supabase
        .from('triajes')
        .select('id')
        .eq('atencion_id', dto.atencion_id)
        .maybeSingle();

    if (triajeExistente) {
      throw new BadRequestException(
        `La atención ${dto.atencion_id} ya tiene un triaje registrado.`,
      );
    }

    const { data, error } = await this.supabase
      .from('triajes')
      .insert({
        atencion_id: dto.atencion_id,
        frecuencia_cardiaca:
          dto.frecuencia_cardiaca ?? null,
        frecuencia_respiratoria:
          dto.frecuencia_respiratoria ?? null,
        temperatura:
          dto.temperatura ?? null,
        presion_arterial:
          dto.presion_arterial ?? null,
        saturacion_oxigeno:
          dto.saturacion_oxigeno ?? null,
        peso:
          dto.peso ?? null,
        talla:
          dto.talla ?? null,
        alergia_farmacos:
          dto.alergia_farmacos ?? false,
        alergia_alimentos:
          dto.alergia_alimentos ?? false,
        clasificacion:
          dto.clasificacion ?? null,
        observaciones:
          dto.observaciones ?? null,
      })
      .select(`
        id,
        atencion_id,
        frecuencia_cardiaca,
        frecuencia_respiratoria,
        temperatura,
        presion_arterial,
        saturacion_oxigeno,
        peso,
        talla,
        alergia_farmacos,
        alergia_alimentos,
        clasificacion,
        observaciones,
        created_at
      `)
      .single();

    if (error) {
      throw new BadRequestException(
        `Error creando triaje: ${error.message}`,
      );
    }

    return data;
  }

  async actualizar(
    id: number,
    dto: ActualizarTriajeDto,
  ) {
    await this.obtenerPorId(id);

    const { data, error } = await this.supabase
      .from('triajes')
      .update(dto)
      .eq('id', id)
      .select(`
        id,
        atencion_id,
        frecuencia_cardiaca,
        frecuencia_respiratoria,
        temperatura,
        presion_arterial,
        saturacion_oxigeno,
        peso,
        talla,
        alergia_farmacos,
        alergia_alimentos,
        clasificacion,
        observaciones,
        created_at
      `)
      .single();

    if (error) {
      throw new BadRequestException(
        `Error actualizando triaje: ${error.message}`,
      );
    }

    return data;
  }
}