import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { SupabaseService } from '../supabase/supabase.service.js';

import { CrearAtencionDto } from '../personas/dto/crear-atencion.dto.js'; 
import { ActualizarAtencionDto } from '../personas/dto/actualizar-atencion.dto.js'; 

@Injectable()
export class AtencionesService {
  constructor(
    private readonly supabaseService: SupabaseService,
  ) {}

  private get supabase() {
    return this.supabaseService.getClient();
  }

  async obtenerTodas() {
    const { data, error } = await this.supabase
      .from('atenciones')
      .select(`
        id,
        persona_id,
        usuario_id,
        fecha_hora,
        turno,
        motivo_atencion,
        sintomas,
        antecedentes_patologicos,
        fecha_inicio_sintomas,
        diagnostico,
        tratamiento,
        indicaciones,
        observaciones,
        estado,
        estado_pse,
        created_at,
        updated_at
      `)
      .order('fecha_hora', { ascending: false });

    if (error) {
      throw new BadRequestException(
        `Error obteniendo atenciones: ${error.message}`,
      );
    }

    return data;
  }

  async obtenerPorId(id: number) {
    const { data, error } = await this.supabase
      .from('atenciones')
      .select(`
        id,
        persona_id,
        usuario_id,
        fecha_hora,
        turno,
        motivo_atencion,
        sintomas,
        antecedentes_patologicos,
        fecha_inicio_sintomas,
        diagnostico,
        tratamiento,
        indicaciones,
        observaciones,
        estado,
        estado_pse,
        created_at,
        updated_at
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(
        `Error buscando atención: ${error.message}`,
      );
    }

    if (!data) {
      throw new NotFoundException(
        `No se encontró la atención con ID ${id}.`,
      );
    }

    return data;
  }

  async obtenerPorPersona(personaId: number) {
    const { data, error } = await this.supabase
      .from('atenciones')
      .select(`
        id,
        persona_id,
        usuario_id,
        fecha_hora,
        turno,
        motivo_atencion,
        sintomas,
        diagnostico,
        tratamiento,
        indicaciones,
        estado,
        estado_pse,
        created_at,
        updated_at
      `)
      .eq('persona_id', personaId)
      .order('fecha_hora', { ascending: false });

    if (error) {
      throw new BadRequestException(
        `Error obteniendo historial: ${error.message}`,
      );
    }

    return data;
  }

  async crear(dto: CrearAtencionDto) {
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

    if (dto.usuario_id !== undefined) {
      const { data: usuario, error: usuarioError } =
        await this.supabase
          .from('usuarios')
          .select('id')
          .eq('id', dto.usuario_id)
          .maybeSingle();

      if (usuarioError) {
        throw new BadRequestException(
          `Error verificando usuario: ${usuarioError.message}`,
        );
      }

      if (!usuario) {
        throw new BadRequestException(
          `El usuario ${dto.usuario_id} no existe.`,
        );
      }
    }

    const { data, error } = await this.supabase
      .from('atenciones')
      .insert({
        persona_id: dto.persona_id,
        usuario_id: dto.usuario_id ?? null,
        turno: dto.turno ?? null,
        motivo_atencion: dto.motivo_atencion,
        sintomas: dto.sintomas ?? null,
        antecedentes_patologicos:
          dto.antecedentes_patologicos ?? null,
        fecha_inicio_sintomas:
          dto.fecha_inicio_sintomas ?? null,
        diagnostico: dto.diagnostico ?? null,
        tratamiento: dto.tratamiento ?? null,
        indicaciones: dto.indicaciones ?? null,
        observaciones: dto.observaciones ?? null,
        estado: 'ABIERTA',
        estado_pse: dto.estado_pse ?? 'NO_VERIFICADO',
      })
      .select(`
        id,
        persona_id,
        usuario_id,
        fecha_hora,
        turno,
        motivo_atencion,
        sintomas,
        antecedentes_patologicos,
        fecha_inicio_sintomas,
        diagnostico,
        tratamiento,
        indicaciones,
        observaciones,
        estado,
        estado_pse,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      throw new BadRequestException(
        `Error creando atención: ${error.message}`,
      );
    }

    return data;
  }

  async actualizar(
    id: number,
    dto: ActualizarAtencionDto,
  ) {
    await this.obtenerPorId(id);

    const { data, error } = await this.supabase
      .from('atenciones')
      .update({
        ...dto,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        id,
        persona_id,
        usuario_id,
        fecha_hora,
        turno,
        motivo_atencion,
        sintomas,
        antecedentes_patologicos,
        fecha_inicio_sintomas,
        diagnostico,
        tratamiento,
        indicaciones,
        observaciones,
        estado,
        estado_pse,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      throw new BadRequestException(
        `Error actualizando atención: ${error.message}`,
      );
    }

    return data;
  }

  async cerrar(id: number) {
    await this.obtenerPorId(id);

    const { data, error } = await this.supabase
      .from('atenciones')
      .update({
        estado: 'CERRADA',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        id,
        persona_id,
        usuario_id,
        fecha_hora,
        turno,
        motivo_atencion,
        sintomas,
        diagnostico,
        tratamiento,
        indicaciones,
        observaciones,
        estado,
        estado_pse,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      throw new BadRequestException(
        `Error cerrando atención: ${error.message}`,
      );
    }

    return data;
  }
}