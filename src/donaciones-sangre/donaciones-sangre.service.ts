import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { SupabaseService } from '../supabase/supabase.service.js';
import { CrearDonacionSangreDto } from '../personas/dto/crear-donacion-sangre.dto.js'; 

@Injectable()
export class DonacionesSangreService {
  constructor(
    private readonly supabaseService: SupabaseService,
  ) {}

  private get supabase() {
    return this.supabaseService.getClient();
  }

  async listar() {
    const { data, error } = await this.supabase
      .from('donaciones_sangre')
      .select(`
        *,
        participaciones_campania (
          id,
          campania_id,
          persona_id,
          fecha_registro,
          estado,
          personas (
            id,
            dni,
            codigo_carnet,
            nombres,
            apellidos,
            telefono,
            correo
          ),
          campanias (
            id,
            nombre,
            tipo,
            fecha_inicio,
            fecha_fin,
            estado
          )
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
      .from('donaciones_sangre')
      .select(`
        *,
        participaciones_campania (
          id,
          campania_id,
          persona_id,
          fecha_registro,
          estado,
          personas (
            id,
            dni,
            codigo_carnet,
            nombres,
            apellidos
          ),
          campanias (
            id,
            nombre,
            tipo,
            fecha_inicio,
            fecha_fin,
            estado
          )
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(error.message);
    }

    if (!data) {
      throw new NotFoundException(
        `No se encontró la donación ${id}`,
      );
    }

    return data;
  }

  async obtenerPorParticipacion(participacionId: number) {
    const { data, error } = await this.supabase
      .from('donaciones_sangre')
      .select(`
        *,
        participaciones_campania (
          id,
          campania_id,
          persona_id,
          estado
        )
      `)
      .eq('participacion_id', participacionId)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async crear(dto: CrearDonacionSangreDto) {
  // 1. Verificar participación
  const { data: participacion, error: errorParticipacion } =
    await this.supabase
      .from('participaciones_campania')
      .select('id, campania_id, persona_id, estado')
      .eq('id', dto.participacion_id)
      .maybeSingle();

  if (errorParticipacion) {
    throw new BadRequestException(
      errorParticipacion.message,
    );
  }

  if (!participacion) {
    throw new NotFoundException(
      `No se encontró la participación ${dto.participacion_id}`,
    );
  }

  // 2. Verificar campaña
  const { data: campania, error: errorCampania } =
    await this.supabase
      .from('campanias')
      .select('id, nombre, tipo, estado')
      .eq('id', participacion.campania_id)
      .maybeSingle();

  if (errorCampania) {
    throw new BadRequestException(
      errorCampania.message,
    );
  }

  if (!campania) {
    throw new NotFoundException(
      `No se encontró la campaña ${participacion.campania_id}`,
    );
  }

  // 3. Verificar que sea una campaña de donación de sangre
  if (campania.tipo !== 'DONACION_SANGRE') {
    throw new BadRequestException(
      'La participación no pertenece a una campaña de donación de sangre',
    );
  }

  // 4. Verificar persona
  const { data: persona, error: errorPersona } =
    await this.supabase
      .from('personas')
      .select(`
        id,
        dni,
        nombres,
        apellidos,
        activo
      `)
      .eq('id', participacion.persona_id)
      .maybeSingle();

  if (errorPersona) {
    throw new BadRequestException(
      errorPersona.message,
    );
  }

  if (!persona) {
    throw new NotFoundException(
      `No se encontró la persona ${participacion.persona_id}`,
    );
  }

  if (!persona.activo) {
    throw new BadRequestException(
      'La persona está inactiva',
    );
  }

  // 5. Verificar si ya existe una donación
  const { data: existente, error: errorExistente } =
    await this.supabase
      .from('donaciones_sangre')
      .select('id')
      .eq('participacion_id', dto.participacion_id)
      .maybeSingle();

  if (errorExistente) {
    throw new BadRequestException(
      errorExistente.message,
    );
  }

  if (existente) {
    throw new BadRequestException(
      'Esta participación ya tiene una donación registrada',
    );
  }

  // 6. Crear donación
  const { data, error } = await this.supabase
    .from('donaciones_sangre')
    .insert({
      participacion_id: dto.participacion_id,
      tipo_sangre: dto.tipo_sangre,
      resultado: dto.resultado ?? 'PENDIENTE',
      fecha_donacion:
        dto.fecha_donacion ?? new Date().toISOString(),
      observaciones: dto.observaciones ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new BadRequestException(error.message);
  }

  return {
    mensaje: 'Donación de sangre registrada correctamente',

    donacion: {
      ...data,
      participacion: {
        id: participacion.id,
        campania_id: participacion.campania_id,
        persona_id: participacion.persona_id,
      },
      campania: {
        id: campania.id,
        nombre: campania.nombre,
        tipo: campania.tipo,
        estado: campania.estado,
      },
      persona: {
        id: persona.id,
        dni: persona.dni,
        nombres: persona.nombres,
        apellidos: persona.apellidos,
      },
    },
  };
}

  async actualizar(
    id: number,
    dto: Partial<CrearDonacionSangreDto>,
  ) {
    await this.obtenerPorId(id);

    const { data, error } = await this.supabase
      .from('donaciones_sangre')
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