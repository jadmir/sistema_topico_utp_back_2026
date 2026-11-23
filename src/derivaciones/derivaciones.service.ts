import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { SupabaseService } from '../supabase/supabase.service.js';
import { CrearDerivacionDto } from '../personas/dto/crear-derivacion.dto.js'; 

@Injectable()
export class DerivacionesService {
  constructor(
    private readonly supabaseService: SupabaseService,
  ) {}

  private get supabase() {
    return this.supabaseService.getClient();
  }

  async listar() {
    const { data, error } = await this.supabase
      .from('derivaciones')
      .select(`
        *,
        atenciones (
          id,
          persona_id,
          fecha_hora,
          motivo_atencion,
          diagnostico,
          estado
        ),
        establecimientos (
          id,
          nombre,
          tipo,
          direccion,
          telefono
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
      .from('derivaciones')
      .select(`
        *,
        atenciones (
          id,
          persona_id,
          fecha_hora,
          motivo_atencion,
          diagnostico,
          estado
        ),
        establecimientos (
          id,
          nombre,
          tipo,
          direccion,
          telefono
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(error.message);
    }

    if (!data) {
      throw new NotFoundException(
        `No se encontró la derivación ${id}`,
      );
    }

    return data;
  }

  async listarPorAtencion(atencionId: number) {
    const { data, error } = await this.supabase
      .from('derivaciones')
      .select(`
        *,
        establecimientos (
          id,
          nombre,
          tipo,
          direccion,
          telefono
        )
      `)
      .eq('atencion_id', atencionId)
      .order('id', { ascending: false });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async crear(dto: CrearDerivacionDto) {
    // 1. Verificar atención
    const { data: atencion, error: errorAtencion } =
      await this.supabase
        .from('atenciones')
        .select('id, estado, diagnostico')
        .eq('id', dto.atencion_id)
        .maybeSingle();

    if (errorAtencion) {
      throw new BadRequestException(errorAtencion.message);
    }

    if (!atencion) {
      throw new NotFoundException(
        `No se encontró la atención ${dto.atencion_id}`,
      );
    }

    if (atencion.estado === 'CANCELADA') {
      throw new BadRequestException(
        'No se puede derivar una atención cancelada',
      );
    }

    // 2. Verificar establecimiento si fue enviado
    if (dto.establecimiento_id) {
      const { data: establecimiento, error: errorEstablecimiento } =
        await this.supabase
          .from('establecimientos')
          .select('id, nombre, activo')
          .eq('id', dto.establecimiento_id)
          .maybeSingle();

      if (errorEstablecimiento) {
        throw new BadRequestException(
          errorEstablecimiento.message,
        );
      }

      if (!establecimiento) {
        throw new NotFoundException(
          `No se encontró el establecimiento ${dto.establecimiento_id}`,
        );
      }

      if (!establecimiento.activo) {
        throw new BadRequestException(
          'El establecimiento seleccionado está inactivo',
        );
      }
    }

    // 3. Crear derivación
    const { data, error } = await this.supabase
      .from('derivaciones')
      .insert({
        atencion_id: dto.atencion_id,
        establecimiento_id: dto.establecimiento_id ?? null,
        motivo: dto.motivo,
        tipo_traslado: dto.tipo_traslado ?? null,
        hora_llamada: dto.hora_llamada ?? null,
        hora_llegada: dto.hora_llegada ?? null,
        hora_traslado: dto.hora_traslado ?? null,
        acompanante: dto.acompanante ?? null,
        estado: dto.estado ?? 'PENDIENTE',
        diagnostico_probable:
          dto.diagnostico_probable ??
          atencion.diagnostico ??
          null,
        observaciones: dto.observaciones ?? null,
      })
      .select(`
        *,
        establecimientos (
          id,
          nombre,
          tipo,
          direccion,
          telefono
        )
      `)
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      mensaje: 'Derivación registrada correctamente',
      derivacion: data,
    };
  }

  async actualizar(
    id: number,
    dto: Partial<CrearDerivacionDto>,
  ) {
    await this.obtenerPorId(id);

    if (dto.establecimiento_id) {
      const { data: establecimiento } = await this.supabase
        .from('establecimientos')
        .select('id, activo')
        .eq('id', dto.establecimiento_id)
        .maybeSingle();

      if (!establecimiento) {
        throw new NotFoundException(
          `No se encontró el establecimiento ${dto.establecimiento_id}`,
        );
      }

      if (!establecimiento.activo) {
        throw new BadRequestException(
          'El establecimiento seleccionado está inactivo',
        );
      }
    }

    const { data, error } = await this.supabase
      .from('derivaciones')
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