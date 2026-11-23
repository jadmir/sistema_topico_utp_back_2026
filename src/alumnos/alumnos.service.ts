import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { SupabaseService } from '../supabase/supabase.service.js';

@Injectable()
export class AlumnosService {
  constructor(
    private readonly supabaseService: SupabaseService,
  ) {}

  private get supabase() {
    return this.supabaseService.getClient();
  }

  /**
   * Obtener todos los alumnos.
   */
  async obtenerTodos() {
    const { data, error } = await this.supabase
      .from('alumnos_nuevo')
      .select(`
        id,
        persona_id,
        codigo_alumno,
        carrera,
        campus,
        estado,
        created_at,
        updated_at
      `)
      .order('id', { ascending: true });

    if (error) {
      throw new BadRequestException(
        `Error obteniendo alumnos: ${error.message}`,
      );
    }

    return data;
  }

  /**
   * Obtener alumno por ID.
   */
  async obtenerPorId(id: number) {
    const { data, error } = await this.supabase
      .from('alumnos_nuevo')
      .select(`
        id,
        persona_id,
        codigo_alumno,
        carrera,
        campus,
        estado,
        created_at,
        updated_at
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(
        `Error buscando alumno: ${error.message}`,
      );
    }

    if (!data) {
      throw new NotFoundException(
        `No se encontró el alumno con ID ${id}`,
      );
    }

    return data;
  }

  /**
   * Obtener alumno por persona.
   */
  async obtenerPorPersona(personaId: number) {
    const { data, error } = await this.supabase
      .from('alumnos_nuevo')
      .select(`
        id,
        persona_id,
        codigo_alumno,
        carrera,
        campus,
        estado,
        created_at,
        updated_at
      `)
      .eq('persona_id', personaId)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(
        `Error buscando alumno: ${error.message}`,
      );
    }

    if (!data) {
      throw new NotFoundException(
        `La persona ${personaId} no tiene un registro de alumno.`,
      );
    }

    return data;
  }

  /**
   * Obtener alumno por código de alumno.
   */
  async obtenerPorCodigo(codigo: string) {
    const { data, error } = await this.supabase
      .from('alumnos_nuevo')
      .select(`
        id,
        persona_id,
        codigo_alumno,
        carrera,
        campus,
        estado,
        created_at,
        updated_at
      `)
      .eq('codigo_alumno', codigo)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(
        `Error buscando alumno por código: ${error.message}`,
      );
    }

    if (!data) {
      throw new NotFoundException(
        `No se encontró un alumno con código ${codigo}.`,
      );
    }

    return data;
  }

  /**
   * Obtener alumno utilizando el DNI de la persona.
   */
  async obtenerPorDni(dni: string) {
    const { data: persona, error: personaError } =
      await this.supabase
        .from('personas')
        .select(`
          id,
          tipo_persona_id,
          dni,
          codigo_carnet,
          nombres,
          apellidos,
          telefono,
          correo,
          activo
        `)
        .eq('dni', dni)
        .maybeSingle();

    if (personaError) {
      throw new BadRequestException(
        `Error buscando persona por DNI: ${personaError.message}`,
      );
    }

    if (!persona) {
      throw new NotFoundException(
        `No se encontró una persona con DNI ${dni}.`,
      );
    }

    const { data: alumno, error: alumnoError } =
      await this.supabase
        .from('alumnos_nuevo')
        .select(`
          id,
          persona_id,
          codigo_alumno,
          carrera,
          campus,
          estado,
          created_at,
          updated_at
        `)
        .eq('persona_id', persona.id)
        .maybeSingle();

    if (alumnoError) {
      throw new BadRequestException(
        `Error buscando alumno: ${alumnoError.message}`,
      );
    }

    if (!alumno) {
      throw new NotFoundException(
        `La persona con DNI ${dni} no tiene registro como alumno.`,
      );
    }

    return {
      persona,
      alumno,
    };
  }

  /**
   * Obtener información completa del alumno:
   * persona + alumno + historial PSE.
   */
  async obtenerResumenPorDni(dni: string) {
    const resultado = await this.obtenerPorDni(dni);

    const { persona, alumno } = resultado;

    const { data: seguros, error: segurosError } =
      await this.supabase
        .from('seguros_nuevo')
        .select(`
          id,
          alumno_id,
          carga_id,
          estado,
          fecha_registro
        `)
        .eq('alumno_id', alumno.id)
        .order('fecha_registro', {
          ascending: false,
        })
        .order('id', {
          ascending: false,
        });

    if (segurosError) {
      throw new BadRequestException(
        `Error obteniendo historial PSE: ${segurosError.message}`,
      );
    }

    const seguroActual = seguros?.[0] ?? null;

    return {
      persona,
      alumno,

      pse: {
        actual: seguroActual,
        historial: seguros ?? [],
      },
    };
  }
}