import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service.js';
import { CrearPersonaDto } from './dto/crear-persona.dto.js';
import { ActualizarPersonaDto } from './dto/actualizar-persona.dto.js';

@Injectable()
export class PersonasService {
  constructor(
    private readonly supabaseService: SupabaseService,
  ) {}

  private get supabase() {
    return this.supabaseService.getClient();
  }

  async obtenerTodas() {
    const { data, error } = await this.supabase
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
        activo,
        created_at,
        updated_at,
        tipos_persona (
          id,
          nombre
        )
      `)
      .order('id', { ascending: true });

    if (error) {
      throw new BadRequestException(
        `Error obteniendo personas: ${error.message}`,
      );
    }

    return data;
  }

  async obtenerPorId(id: number) {
    const { data, error } = await this.supabase
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
        activo,
        created_at,
        updated_at,
        tipos_persona (
          id,
          nombre
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(
        `Error buscando persona: ${error.message}`,
      );
    }

    if (!data) {
      throw new NotFoundException(
        `No se encontró la persona con ID ${id}`,
      );
    }

    return data;
  }

  async obtenerPorDni(dni: string) {
    const { data, error } = await this.supabase
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
        activo,
        created_at,
        updated_at,
        tipos_persona (
          id,
          nombre
        )
      `)
      .eq('dni', dni)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(
        `Error buscando persona por DNI: ${error.message}`,
      );
    }

    if (!data) {
      throw new NotFoundException(
        `No se encontró una persona con DNI ${dni}`,
      );
    }

    return data;
  }

  async crear(dto: CrearPersonaDto) {
    const { data: tipoPersona, error: tipoError } =
      await this.supabase
        .from('tipos_persona')
        .select('id')
        .eq('id', dto.tipo_persona_id)
        .maybeSingle();

    if (tipoError) {
      throw new BadRequestException(
        `Error verificando tipo de persona: ${tipoError.message}`,
      );
    }

    if (!tipoPersona) {
      throw new BadRequestException(
        `El tipo de persona ${dto.tipo_persona_id} no existe.`,
      );
    }

    if (dto.dni) {
      const { data: personaExistente } = await this.supabase
        .from('personas')
        .select('id')
        .eq('dni', dto.dni)
        .maybeSingle();

      if (personaExistente) {
        throw new BadRequestException(
          `Ya existe una persona con DNI ${dto.dni}.`,
        );
      }
    }

    const { data, error } = await this.supabase
      .from('personas')
      .insert({
        tipo_persona_id: dto.tipo_persona_id,
        dni: dto.dni ?? null,
        codigo_carnet: dto.codigo_carnet ?? null,
        nombres: dto.nombres,
        apellidos: dto.apellidos ?? null,
        telefono: dto.telefono ?? null,
        correo: dto.correo ?? null,
        activo: true,
      })
      .select(`
        id,
        tipo_persona_id,
        dni,
        codigo_carnet,
        nombres,
        apellidos,
        telefono,
        correo,
        activo,
        created_at,
        updated_at,
        tipos_persona (
          id,
          nombre
        )
      `)
      .single();

    if (error) {
      throw new BadRequestException(
        `Error creando persona: ${error.message}`,
      );
    }

    return data;
  }

  async actualizar(
    id: number,
    dto: ActualizarPersonaDto,
  ) {
    await this.obtenerPorId(id);

    if (dto.tipo_persona_id !== undefined) {
      const { data: tipoPersona, error: tipoError } =
        await this.supabase
          .from('tipos_persona')
          .select('id')
          .eq('id', dto.tipo_persona_id)
          .maybeSingle();

      if (tipoError) {
        throw new BadRequestException(
          `Error verificando tipo de persona: ${tipoError.message}`,
        );
      }

      if (!tipoPersona) {
        throw new BadRequestException(
          `El tipo de persona ${dto.tipo_persona_id} no existe.`,
        );
      }
    }

    if (dto.dni) {
      const { data: personaExistente } = await this.supabase
        .from('personas')
        .select('id')
        .eq('dni', dto.dni)
        .neq('id', id)
        .maybeSingle();

      if (personaExistente) {
        throw new BadRequestException(
          `El DNI ${dto.dni} ya pertenece a otra persona.`,
        );
      }
    }

    const { data, error } = await this.supabase
      .from('personas')
      .update({
        ...dto,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        id,
        tipo_persona_id,
        dni,
        codigo_carnet,
        nombres,
        apellidos,
        telefono,
        correo,
        activo,
        created_at,
        updated_at,
        tipos_persona (
          id,
          nombre
        )
      `)
      .single();

    if (error) {
      throw new BadRequestException(
        `Error actualizando persona: ${error.message}`,
      );
    }

    return data;
  }
}