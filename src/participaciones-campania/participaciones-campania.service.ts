import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { SupabaseService } from '../supabase/supabase.service.js';
import { CrearParticipacionCampaniaDto } from '../personas/dto/crear-participacion-campania.dto.js'; 

@Injectable()
export class ParticipacionesCampaniaService {
  constructor(
    private readonly supabaseService: SupabaseService,
  ) {}

  private get supabase() {
    return this.supabaseService.getClient();
  }

  async listar() {
    const { data, error } = await this.supabase
      .from('participaciones_campania')
      .select(`
        *,
        campanias (
          id,
          nombre,
          tipo,
          fecha_inicio,
          fecha_fin,
          estado
        ),
        personas (
          id,
          dni,
          codigo_carnet,
          nombres,
          apellidos,
          telefono,
          correo
        )
      `)
      .order('id', { ascending: false });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async obtenerPorId(id: number) {
    const { data, error } = await this.supabase
      .from('participaciones_campania')
      .select(`
        *,
        campanias (
          id,
          nombre,
          tipo,
          fecha_inicio,
          fecha_fin,
          estado
        ),
        personas (
          id,
          dni,
          codigo_carnet,
          nombres,
          apellidos,
          telefono,
          correo
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(error.message);
    }

    if (!data) {
      throw new NotFoundException(
        `No se encontró la participación ${id}`,
      );
    }

    return data;
  }

  async listarPorCampania(campaniaId: number) {
    const { data, error } = await this.supabase
      .from('participaciones_campania')
      .select(`
        *,
        personas (
          id,
          dni,
          codigo_carnet,
          nombres,
          apellidos,
          telefono,
          correo
        )
      `)
      .eq('campania_id', campaniaId)
      .order('id', { ascending: true });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async listarPorPersona(personaId: number) {
    const { data, error } = await this.supabase
      .from('participaciones_campania')
      .select(`
        *,
        campanias (
          id,
          nombre,
          tipo,
          fecha_inicio,
          fecha_fin,
          estado
        )
      `)
      .eq('persona_id', personaId)
      .order('id', { ascending: false });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async crear(dto: CrearParticipacionCampaniaDto) {
    // 1. Verificar campaña
    const { data: campania, error: errorCampania } =
      await this.supabase
        .from('campanias')
        .select('id, nombre, estado')
        .eq('id', dto.campania_id)
        .maybeSingle();

    if (errorCampania) {
      throw new BadRequestException(errorCampania.message);
    }

    if (!campania) {
      throw new NotFoundException(
        `No se encontró la campaña ${dto.campania_id}`,
      );
    }

    if (campania.estado === 'CANCELADA') {
      throw new BadRequestException(
        'No se puede registrar una persona en una campaña cancelada',
      );
    }

    // 2. Verificar persona
    const { data: persona, error: errorPersona } =
      await this.supabase
        .from('personas')
        .select(`
          id,
          dni,
          codigo_carnet,
          nombres,
          apellidos,
          activo
        `)
        .eq('id', dto.persona_id)
        .maybeSingle();

    if (errorPersona) {
      throw new BadRequestException(errorPersona.message);
    }

    if (!persona) {
      throw new NotFoundException(
        `No se encontró la persona ${dto.persona_id}`,
      );
    }

    if (!persona.activo) {
      throw new BadRequestException(
        'La persona está inactiva',
      );
    }

    // 3. Verificar duplicado
    const { data: existente } = await this.supabase
      .from('participaciones_campania')
      .select('id')
      .eq('campania_id', dto.campania_id)
      .eq('persona_id', dto.persona_id)
      .maybeSingle();

    if (existente) {
      throw new BadRequestException(
        'La persona ya está registrada en esta campaña',
      );
    }

    // 4. Registrar participación
    const { data, error } = await this.supabase
      .from('participaciones_campania')
      .insert({
        campania_id: dto.campania_id,
        persona_id: dto.persona_id,
        fecha_registro:
          dto.fecha_registro ?? new Date().toISOString(),
        estado: dto.estado ?? 'REGISTRADO',
        observaciones: dto.observaciones ?? null,
      })
      .select(`
        *,
        campanias (
          id,
          nombre,
          tipo,
          estado
        ),
        personas (
          id,
          dni,
          nombres,
          apellidos
        )
      `)
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      mensaje: 'Participación registrada correctamente',
      participacion: data,
    };
  }

  async actualizar(
    id: number,
    dto: Partial<CrearParticipacionCampaniaDto>,
  ) {
    await this.obtenerPorId(id);

    const { data, error } = await this.supabase
      .from('participaciones_campania')
      .update(dto)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }
}