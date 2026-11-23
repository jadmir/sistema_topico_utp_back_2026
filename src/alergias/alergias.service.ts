import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { SupabaseService } from '../supabase/supabase.service.js';

import { CrearAlergiaDto } from '../personas/dto/crear-alergia.dto.js';
import { ActualizarAlergiaDto } from '../personas/dto/actualizar-alergia.dto.js'; 

@Injectable()
export class AlergiasService {
  constructor(
    private readonly supabaseService: SupabaseService,
  ) {}

  private get supabase() {
    return this.supabaseService.getClient();
  }

  async obtenerPorPersona(personaId: number) {
    const { data, error } = await this.supabase
      .from('alergias')
      .select(`
        id,
        persona_id,
        tipo,
        alergeno,
        descripcion,
        activo,
        observaciones,
        created_at
      `)
      .eq('persona_id', personaId)
      .order('id', { ascending: false });

    if (error) {
      throw new BadRequestException(
        `Error obteniendo alergias: ${error.message}`,
      );
    }

    return data;
  }

  async obtenerPorId(id: number) {
    const { data, error } = await this.supabase
      .from('alergias')
      .select(`
        id,
        persona_id,
        tipo,
        alergeno,
        descripcion,
        activo,
        observaciones,
        created_at
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(
        `Error buscando alergia: ${error.message}`,
      );
    }

    if (!data) {
      throw new NotFoundException(
        `No se encontró la alergia con ID ${id}.`,
      );
    }

    return data;
  }

  async crear(dto: CrearAlergiaDto) {
    const { data: persona, error: personaError } =
      await this.supabase
        .from('personas')
        .select('id')
        .eq('id', dto.persona_id)
        .maybeSingle();

    if (personaError) {
      throw new BadRequestException(
        `Error verificando persona: ${personaError.message}`,
      );
    }

    if (!persona) {
      throw new BadRequestException(
        `La persona ${dto.persona_id} no existe.`,
      );
    }

    const { data, error } = await this.supabase
      .from('alergias')
      .insert({
        persona_id: dto.persona_id,
        tipo: dto.tipo,
        alergeno: dto.alergeno,
        descripcion: dto.descripcion ?? null,
        observaciones: dto.observaciones ?? null,
        activo: true,
      })
      .select(`
        id,
        persona_id,
        tipo,
        alergeno,
        descripcion,
        activo,
        observaciones,
        created_at
      `)
      .single();

    if (error) {
      throw new BadRequestException(
        `Error creando alergia: ${error.message}`,
      );
    }

    return data;
  }

  async actualizar(
    id: number,
    dto: ActualizarAlergiaDto,
  ) {
    await this.obtenerPorId(id);

    const { data, error } = await this.supabase
      .from('alergias')
      .update(dto)
      .eq('id', id)
      .select(`
        id,
        persona_id,
        tipo,
        alergeno,
        descripcion,
        activo,
        observaciones,
        created_at
      `)
      .single();

    if (error) {
      throw new BadRequestException(
        `Error actualizando alergia: ${error.message}`,
      );
    }

    return data;
  }

  async eliminar(id: number) {
    await this.obtenerPorId(id);

    const { data, error } = await this.supabase
      .from('alergias')
      .update({
        activo: false,
      })
      .eq('id', id)
      .select(`
        id,
        persona_id,
        tipo,
        alergeno,
        descripcion,
        activo,
        observaciones,
        created_at
      `)
      .single();

    if (error) {
      throw new BadRequestException(
        `Error desactivando alergia: ${error.message}`,
      );
    }

    return data;
  }
}