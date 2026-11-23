import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { SupabaseService } from '../supabase/supabase.service.js';
import { CrearDetalleAtencionDto } from '../personas/dto/crear-detalle-atencion.dto.js'; 

@Injectable()
export class DetalleAtencionesService {
  constructor(
    private readonly supabaseService: SupabaseService,
  ) {}

  private get supabase() {
    return this.supabaseService.getClient();
  }

  async listar() {
    const { data, error } = await this.supabase
      .from('detalle_atenciones')
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
        lotes (
          id,
          numero_lote,
          fecha_vencimiento,
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
      .from('detalle_atenciones')
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
        lotes (
          id,
          numero_lote,
          fecha_vencimiento,
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
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(error.message);
    }

    if (!data) {
      throw new NotFoundException(
        `No se encontró el detalle de atención ${id}`,
      );
    }

    return data;
  }

  async listarPorAtencion(atencionId: number) {
    const { data, error } = await this.supabase
      .from('detalle_atenciones')
      .select(`
        *,
        lotes (
          id,
          numero_lote,
          fecha_vencimiento,
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
        )
      `)
      .eq('atencion_id', atencionId)
      .order('id', { ascending: true });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async crear(dto: CrearDetalleAtencionDto) {
    // 1. Verificar atención
    const { data: atencion, error: errorAtencion } =
      await this.supabase
        .from('atenciones')
        .select('id, estado, usuario_id')
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

    if (atencion.estado !== 'ABIERTA') {
      throw new BadRequestException(
        'Solo se pueden registrar medicamentos en una atención ABIERTA',
      );
    }

    // 2. Verificar lote
    const { data: lote, error: errorLote } =
      await this.supabase
        .from('lotes')
        .select(`
          id,
          numero_lote,
          fecha_vencimiento,
          productos (
            id,
            nombre,
            codigo
          )
        `)
        .eq('id', dto.lote_id)
        .maybeSingle();

    if (errorLote) {
      throw new BadRequestException(errorLote.message);
    }

    if (!lote) {
      throw new NotFoundException(
        `No se encontró el lote ${dto.lote_id}`,
      );
    }

    // 3. Buscar existencias disponibles
    const { data: existencias, error: errorExistencia } =
      await this.supabase
        .from('existencias')
        .select(`
          id,
          cantidad,
          ubicacion_id
        `)
        .eq('lote_id', dto.lote_id)
        .gt('cantidad', 0)
        .order('cantidad', { ascending: false });

    if (errorExistencia) {
      throw new BadRequestException(errorExistencia.message);
    }

    if (!existencias || existencias.length === 0) {
      throw new BadRequestException(
        'El lote no tiene stock disponible',
      );
    }

    // 4. Calcular stock total
    const stockTotal = existencias.reduce(
      (total, existencia) =>
        total + Number(existencia.cantidad),
      0,
    );

    if (dto.cantidad > stockTotal) {
      throw new BadRequestException(
        `Stock insuficiente. Disponible: ${stockTotal}`,
      );
    }

    // 5. Elegir ubicación con stock
    const existencia = existencias[0];

    const stockAntes = Number(existencia.cantidad);

    if (dto.cantidad > stockAntes) {
      throw new BadRequestException(
        `La ubicación ${existencia.ubicacion_id} no tiene suficiente stock`,
      );
    }

    // 6. Crear detalle de atención
    const { data: detalle, error: errorDetalle } =
      await this.supabase
        .from('detalle_atenciones')
        .insert({
          atencion_id: dto.atencion_id,
          lote_id: dto.lote_id,
          cantidad: dto.cantidad,
          observaciones: dto.observaciones,
        })
        .select(`
          *,
          lotes (
            id,
            numero_lote,
            fecha_vencimiento,
            productos (
              id,
              codigo,
              nombre
            )
          )
        `)
        .single();

    if (errorDetalle) {
      throw new BadRequestException(errorDetalle.message);
    }

    // 7. Crear movimiento de inventario
    const { data: movimiento, error: errorMovimiento } =
      await this.supabase
        .from('movimientos_inventario')
        .insert({
          lote_id: dto.lote_id,
          ubicacion_origen_id: existencia.ubicacion_id,
          atencion_id: dto.atencion_id,
          usuario_id: atencion.usuario_id ?? null,
          tipo_movimiento: 'SALIDA',
          cantidad: dto.cantidad,
          motivo: 'Consumo de medicamento en atención',
          observaciones: dto.observaciones ?? null,
        })
        .select()
        .single();

    if (errorMovimiento) {
      await this.supabase
        .from('detalle_atenciones')
        .delete()
        .eq('id', detalle.id);

      throw new BadRequestException(
        `No se pudo registrar el movimiento de inventario: ${errorMovimiento.message}`,
      );
    }

    // 8. Descontar stock
    const nuevoStock =
      stockAntes - Number(dto.cantidad);

    const {
      data: existenciaActualizada,
      error: errorStock,
    } = await this.supabase
      .from('existencias')
      .update({
        cantidad: nuevoStock,
      })
      .eq('id', existencia.id)
      .select()
      .single();

    if (errorStock) {
      await this.supabase
        .from('movimientos_inventario')
        .delete()
        .eq('id', movimiento.id);

      await this.supabase
        .from('detalle_atenciones')
        .delete()
        .eq('id', detalle.id);

      throw new BadRequestException(
        `No se pudo actualizar el stock: ${errorStock.message}`,
      );
    }

    return {
      mensaje:
        'Medicamento registrado y stock actualizado correctamente',

      detalle,

      movimiento,

      inventario: {
        existencia_id: existencia.id,
        ubicacion_id: existencia.ubicacion_id,
        stock_antes: stockAntes,
        cantidad_salida: dto.cantidad,
        stock_actual: existenciaActualizada.cantidad,
      },
    };
  }

  async actualizar(
    id: number,
    observaciones?: string,
  ) {
    const detalle = await this.obtenerPorId(id);

    const { data, error } = await this.supabase
      .from('detalle_atenciones')
      .update({
        observaciones,
      })
      .eq('id', detalle.id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }
}