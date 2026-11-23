import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { SupabaseService } from '../supabase/supabase.service.js';

import { CrearExistenciaDto } from '../personas/dto/crear-existencia.dto.js'; 
import { ActualizarExistenciaDto } from '../personas/dto/actualizar-existencia.dto.js'; 

@Injectable()
export class ExistenciasService {
  constructor(
    private readonly supabaseService: SupabaseService,
  ) {}

  private get supabase() {
    return this.supabaseService.getClient();
  }

  async obtenerTodas() {
    const { data, error } = await this.supabase
      .from('existencias')
      .select(`
        id,
        lote_id,
        ubicacion_id,
        cantidad,
        stock_minimo,
        updated_at,

        lotes (
          id,
          numero_lote,
          fecha_vencimiento,
          cantidad_inicial,

          productos (
            id,
            codigo,
            nombre,
            presentacion,
            unidad_medida
          ),

          marcas (
            id,
            nombre
          )
        ),

        ubicaciones (
          id,
          nombre,
          tipo
        )
      `)
      .order('updated_at', { ascending: false });

    if (error) {
      throw new BadRequestException(
        `Error obteniendo existencias: ${error.message}`,
      );
    }

    return data;
  }

  async obtenerPorId(id: number) {
    const { data, error } = await this.supabase
      .from('existencias')
      .select(`
        id,
        lote_id,
        ubicacion_id,
        cantidad,
        stock_minimo,
        updated_at,

        lotes (
          id,
          numero_lote,
          fecha_vencimiento,
          cantidad_inicial,

          productos (
            id,
            codigo,
            nombre,
            presentacion,
            unidad_medida
          ),

          marcas (
            id,
            nombre
          )
        ),

        ubicaciones (
          id,
          nombre,
          tipo
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(
        `Error buscando existencia: ${error.message}`,
      );
    }

    if (!data) {
      throw new NotFoundException(
        `No se encontró la existencia ${id}.`,
      );
    }

    return data;
  }

  async obtenerPorLote(loteId: number) {
    const { data, error } = await this.supabase
      .from('existencias')
      .select(`
        id,
        lote_id,
        ubicacion_id,
        cantidad,
        stock_minimo,
        updated_at,

        lotes (
          id,
          numero_lote,
          fecha_vencimiento,
          cantidad_inicial,

          productos (
            id,
            codigo,
            nombre,
            presentacion,
            unidad_medida
          ),

          marcas (
            id,
            nombre
          )
        ),

        ubicaciones (
          id,
          nombre,
          tipo
        )
      `)
      .eq('lote_id', loteId);

    if (error) {
      throw new BadRequestException(
        `Error obteniendo existencias del lote: ${error.message}`,
      );
    }

    return data;
  }

  async obtenerPorUbicacion(ubicacionId: number) {
    const { data, error } = await this.supabase
      .from('existencias')
      .select(`
        id,
        lote_id,
        ubicacion_id,
        cantidad,
        stock_minimo,
        updated_at,

        lotes (
          id,
          numero_lote,
          fecha_vencimiento,
          cantidad_inicial,

          productos (
            id,
            codigo,
            nombre,
            presentacion,
            unidad_medida
          ),

          marcas (
            id,
            nombre
          )
        ),

        ubicaciones (
          id,
          nombre,
          tipo
        )
      `)
      .eq('ubicacion_id', ubicacionId);

    if (error) {
      throw new BadRequestException(
        `Error obteniendo existencias de la ubicación: ${error.message}`,
      );
    }

    return data;
  }

  async crear(dto: CrearExistenciaDto) {
    // Verificar lote
    const { data: lote, error: loteError } =
      await this.supabase
        .from('lotes')
        .select('id, cantidad_inicial')
        .eq('id', dto.lote_id)
        .maybeSingle();

    if (loteError) {
      throw new BadRequestException(
        `Error verificando lote: ${loteError.message}`,
      );
    }

    if (!lote) {
      throw new BadRequestException(
        `El lote ${dto.lote_id} no existe.`,
      );
    }

    // Verificar ubicación
    const { data: ubicacion, error: ubicacionError } =
      await this.supabase
        .from('ubicaciones')
        .select('id')
        .eq('id', dto.ubicacion_id)
        .maybeSingle();

    if (ubicacionError) {
      throw new BadRequestException(
        `Error verificando ubicación: ${ubicacionError.message}`,
      );
    }

    if (!ubicacion) {
      throw new BadRequestException(
        `La ubicación ${dto.ubicacion_id} no existe.`,
      );
    }

    // Evitar duplicar lote + ubicación
    const { data: existente } = await this.supabase
      .from('existencias')
      .select('id')
      .eq('lote_id', dto.lote_id)
      .eq('ubicacion_id', dto.ubicacion_id)
      .maybeSingle();

    if (existente) {
      throw new BadRequestException(
        'Ya existe una existencia para este lote en esta ubicación.',
      );
    }

    // No permitir que el stock inicial supere la cantidad del lote
    if (dto.cantidad > lote.cantidad_inicial) {
      throw new BadRequestException(
        `La cantidad (${dto.cantidad}) no puede superar la cantidad inicial del lote (${lote.cantidad_inicial}).`,
      );
    }

    const { data, error } = await this.supabase
      .from('existencias')
      .insert({
        lote_id: dto.lote_id,
        ubicacion_id: dto.ubicacion_id,
        cantidad: dto.cantidad,
        stock_minimo: dto.stock_minimo,
      })
      .select(`
        id,
        lote_id,
        ubicacion_id,
        cantidad,
        stock_minimo,
        updated_at,

        lotes (
          id,
          numero_lote,
          fecha_vencimiento,
          cantidad_inicial
        ),

        ubicaciones (
          id,
          nombre,
          tipo
        )
      `)
      .single();

    if (error) {
      throw new BadRequestException(
        `Error creando existencia: ${error.message}`,
      );
    }

    return data;
  }

  async actualizar(
    id: number,
    dto: ActualizarExistenciaDto,
  ) {
    const existencia = await this.obtenerPorId(id);

    if (
      dto.cantidad !== undefined &&
      dto.cantidad < 0
    ) {
      throw new BadRequestException(
        'La cantidad no puede ser negativa.',
      );
    }

    const { data, error } = await this.supabase
      .from('existencias')
      .update({
        ...dto,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        id,
        lote_id,
        ubicacion_id,
        cantidad,
        stock_minimo,
        updated_at
      `)
      .single();

    if (error) {
      throw new BadRequestException(
        `Error actualizando existencia: ${error.message}`,
      );
    }

    return data;
  }
}