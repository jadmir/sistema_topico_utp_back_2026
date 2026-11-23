import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { SupabaseService } from '../supabase/supabase.service.js';

import { CrearMovimientoDto } from '../personas/dto/crear-movimiento.dto.js'; 

@Injectable()
export class MovimientosInventarioService {
  constructor(
    private readonly supabaseService: SupabaseService,
  ) {}

  private get supabase() {
    return this.supabaseService.getClient();
  }

  async obtenerTodos() {
  const { data, error } = await this.supabase
    .from('movimientos_inventario')
    .select(`
      id,
      lote_id,
      ubicacion_origen_id,
      ubicacion_destino_id,
      atencion_id,
      usuario_id,
      tipo_movimiento,
      cantidad,
      motivo,
      fecha,
      observaciones
    `)
    .order('fecha', { ascending: false });

  if (error) {
    throw new BadRequestException(
      `Error obteniendo movimientos: ${error.message}`,
    );
  }

  return data;
}

  async obtenerPorId(id: number) {
    const { data, error } = await this.supabase
      .from('movimientos_inventario')
      .select(`
        id,
        lote_id,
        ubicacion_origen_id,
        ubicacion_destino_id,
        atencion_id,
        usuario_id,
        tipo_movimiento,
        cantidad,
        motivo,
        fecha,
        observaciones
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(
        `Error buscando movimiento: ${error.message}`,
      );
    }

    if (!data) {
      throw new NotFoundException(
        `No se encontró el movimiento ${id}.`,
      );
    }

    return data;
  }

  async obtenerPorLote(loteId: number) {
    const { data, error } = await this.supabase
      .from('movimientos_inventario')
      .select(`
        id,
        lote_id,
        ubicacion_origen_id,
        ubicacion_destino_id,
        atencion_id,
        usuario_id,
        tipo_movimiento,
        cantidad,
        motivo,
        fecha,
        observaciones
      `)
      .eq('lote_id', loteId)
      .order('fecha', { ascending: false });

    if (error) {
      throw new BadRequestException(
        `Error obteniendo movimientos del lote: ${error.message}`,
      );
    }

    return data;
  }

  async crear(dto: CrearMovimientoDto) {
    // -------------------------------------------------
    // 1. Verificar lote
    // -------------------------------------------------

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

    // -------------------------------------------------
    // 2. Verificar ubicaciones
    // -------------------------------------------------

    if (dto.ubicacion_origen_id !== undefined) {
      const { data: origen } =
        await this.supabase
          .from('ubicaciones')
          .select('id')
          .eq('id', dto.ubicacion_origen_id)
          .maybeSingle();

      if (!origen) {
        throw new BadRequestException(
          `La ubicación origen ${dto.ubicacion_origen_id} no existe.`,
        );
      }
    }

    if (dto.ubicacion_destino_id !== undefined) {
      const { data: destino } =
        await this.supabase
          .from('ubicaciones')
          .select('id')
          .eq('id', dto.ubicacion_destino_id)
          .maybeSingle();

      if (!destino) {
        throw new BadRequestException(
          `La ubicación destino ${dto.ubicacion_destino_id} no existe.`,
        );
      }
    }

    // -------------------------------------------------
    // 3. Verificar atención
    // -------------------------------------------------

    if (dto.atencion_id !== undefined) {
      const { data: atencion } =
        await this.supabase
          .from('atenciones')
          .select('id')
          .eq('id', dto.atencion_id)
          .maybeSingle();

      if (!atencion) {
        throw new BadRequestException(
          `La atención ${dto.atencion_id} no existe.`,
        );
      }
    }

    // -------------------------------------------------
    // 4. Verificar usuario
    // -------------------------------------------------

    if (dto.usuario_id !== undefined) {
      const { data: usuario } =
        await this.supabase
          .from('usuarios')
          .select('id')
          .eq('id', dto.usuario_id)
          .maybeSingle();

      if (!usuario) {
        throw new BadRequestException(
          `El usuario ${dto.usuario_id} no existe.`,
        );
      }
    }

    // -------------------------------------------------
    // 5. Validaciones según tipo
    // -------------------------------------------------

    switch (dto.tipo_movimiento) {
      case 'ENTRADA':
      case 'AJUSTE_POSITIVO':
        if (!dto.ubicacion_destino_id) {
          throw new BadRequestException(
            `El movimiento ${dto.tipo_movimiento} requiere una ubicación destino.`,
          );
        }
        break;

      case 'SALIDA':
      case 'AJUSTE_NEGATIVO':
      case 'VENCIMIENTO':
      case 'MERMA':
        if (!dto.ubicacion_origen_id) {
          throw new BadRequestException(
            `El movimiento ${dto.tipo_movimiento} requiere una ubicación origen.`,
          );
        }
        break;

      case 'TRASLADO':
        if (
          !dto.ubicacion_origen_id ||
          !dto.ubicacion_destino_id
        ) {
          throw new BadRequestException(
            'Un traslado requiere ubicación origen y destino.',
          );
        }

        if (
          dto.ubicacion_origen_id ===
          dto.ubicacion_destino_id
        ) {
          throw new BadRequestException(
            'La ubicación origen y destino deben ser diferentes.',
          );
        }
        break;
    }

    // -------------------------------------------------
    // 6. Obtener existencia origen/destino
    // -------------------------------------------------

    let existenciaOrigen: {
      id: number;
      cantidad: number;
    } | null = null;

    let existenciaDestino: {
      id: number;
      cantidad: number;
    } | null = null;

    if (dto.ubicacion_origen_id) {
      const { data, error } = await this.supabase
        .from('existencias')
        .select('id, cantidad')
        .eq('lote_id', dto.lote_id)
        .eq(
          'ubicacion_id',
          dto.ubicacion_origen_id,
        )
        .maybeSingle();

      if (error) {
        throw new BadRequestException(
          `Error consultando existencia origen: ${error.message}`,
        );
      }

      existenciaOrigen = data;
    }

    if (dto.ubicacion_destino_id) {
      const { data, error } = await this.supabase
        .from('existencias')
        .select('id, cantidad')
        .eq('lote_id', dto.lote_id)
        .eq(
          'ubicacion_id',
          dto.ubicacion_destino_id,
        )
        .maybeSingle();

      if (error) {
        throw new BadRequestException(
          `Error consultando existencia destino: ${error.message}`,
        );
      }

      existenciaDestino = data;
    }

    // -------------------------------------------------
    // 7. Validar stock suficiente
    // -------------------------------------------------

    const movimientosQueRestanStock = [
      'SALIDA',
      'AJUSTE_NEGATIVO',
      'VENCIMIENTO',
      'MERMA',
      'TRASLADO',
    ];

    if (
      movimientosQueRestanStock.includes(
        dto.tipo_movimiento,
      )
    ) {
      if (!existenciaOrigen) {
        throw new BadRequestException(
          'No existe stock del lote en la ubicación origen.',
        );
      }

      if (
        existenciaOrigen.cantidad <
        dto.cantidad
      ) {
        throw new BadRequestException(
          `Stock insuficiente. Disponible: ${existenciaOrigen.cantidad}. Solicitado: ${dto.cantidad}.`,
        );
      }
    }

    // -------------------------------------------------
    // 8. Para entradas/traslados crear existencia
    //    destino si todavía no existe
    // -------------------------------------------------

    if (
      dto.ubicacion_destino_id &&
      !existenciaDestino
    ) {
      const { data, error } = await this.supabase
        .from('existencias')
        .insert({
          lote_id: dto.lote_id,
          ubicacion_id:
            dto.ubicacion_destino_id,
          cantidad: 0,
          stock_minimo: 0,
        })
        .select('id, cantidad')
        .single();

      if (error) {
        throw new BadRequestException(
          `Error creando existencia destino: ${error.message}`,
        );
      }

      existenciaDestino = data;
    }

    // -------------------------------------------------
    // 9. Registrar movimiento
    // -------------------------------------------------

    const { data: movimiento, error: movimientoError } =
      await this.supabase
        .from('movimientos_inventario')
        .insert({
          lote_id: dto.lote_id,
          ubicacion_origen_id:
            dto.ubicacion_origen_id ?? null,
          ubicacion_destino_id:
            dto.ubicacion_destino_id ?? null,
          atencion_id:
            dto.atencion_id ?? null,
          usuario_id:
            dto.usuario_id ?? null,
          tipo_movimiento:
            dto.tipo_movimiento,
          cantidad: dto.cantidad,
          motivo: dto.motivo,
          fecha:
            dto.fecha ??
            new Date().toISOString(),
          observaciones:
            dto.observaciones ?? null,
        })
        .select(`
          id,
          lote_id,
          ubicacion_origen_id,
          ubicacion_destino_id,
          atencion_id,
          usuario_id,
          tipo_movimiento,
          cantidad,
          motivo,
          fecha,
          observaciones
        `)
        .single();

    if (movimientoError) {
      throw new BadRequestException(
        `Error registrando movimiento: ${movimientoError.message}`,
      );
    }

    // -------------------------------------------------
    // 10. Actualizar stock origen
    // -------------------------------------------------

    if (
      existenciaOrigen &&
      dto.ubicacion_origen_id &&
      [
        'SALIDA',
        'AJUSTE_NEGATIVO',
        'VENCIMIENTO',
        'MERMA',
        'TRASLADO',
      ].includes(dto.tipo_movimiento)
    ) {
      const nuevaCantidad =
        existenciaOrigen.cantidad -
        dto.cantidad;

      const { error } = await this.supabase
        .from('existencias')
        .update({
          cantidad: nuevaCantidad,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existenciaOrigen.id);

      if (error) {
        throw new BadRequestException(
          `El movimiento se registró, pero ocurrió un error actualizando el stock origen: ${error.message}`,
        );
      }
    }

    // -------------------------------------------------
    // 11. Actualizar stock destino
    // -------------------------------------------------

    if (
      existenciaDestino &&
      dto.ubicacion_destino_id &&
      [
        'ENTRADA',
        'AJUSTE_POSITIVO',
        'TRASLADO',
      ].includes(dto.tipo_movimiento)
    ) {
      const nuevaCantidad =
        existenciaDestino.cantidad +
        dto.cantidad;

      const { error } = await this.supabase
        .from('existencias')
        .update({
          cantidad: nuevaCantidad,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existenciaDestino.id);

      if (error) {
        throw new BadRequestException(
          `El movimiento se registró, pero ocurrió un error actualizando el stock destino: ${error.message}`,
        );
      }
    }

    return {
      mensaje: 'Movimiento registrado correctamente.',
      movimiento,
    };
  }
}