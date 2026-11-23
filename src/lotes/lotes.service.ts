import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { SupabaseService } from '../supabase/supabase.service.js';

import { CrearLoteDto } from '../personas/dto/crear-lote.dto.js'; 
import { ActualizarLoteDto } from '../personas/dto/actualizar-lote.dto.js'; 

@Injectable()
export class LotesService {
  constructor(
    private readonly supabaseService: SupabaseService,
  ) {}

  private get supabase() {
    return this.supabaseService.getClient();
  }

  async obtenerTodos() {
    const { data, error } = await this.supabase
      .from('lotes')
      .select(`
        id,
        producto_id,
        marca_id,
        numero_lote,
        fecha_ingreso,
        fecha_vencimiento,
        anio_compra,
        cantidad_inicial,
        observaciones,
        created_at,

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
      `)
      .order('fecha_vencimiento', {
        ascending: true,
      });

    if (error) {
      throw new BadRequestException(
        `Error obteniendo lotes: ${error.message}`,
      );
    }

    return data;
  }

  async obtenerPorId(id: number) {
    const { data, error } = await this.supabase
      .from('lotes')
      .select(`
        id,
        producto_id,
        marca_id,
        numero_lote,
        fecha_ingreso,
        fecha_vencimiento,
        anio_compra,
        cantidad_inicial,
        observaciones,
        created_at,

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
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(
        `Error buscando lote: ${error.message}`,
      );
    }

    if (!data) {
      throw new NotFoundException(
        `No se encontró el lote ${id}.`,
      );
    }

    return data;
  }

  async obtenerPorProducto(productoId: number) {
    const { data, error } = await this.supabase
      .from('lotes')
      .select(`
        id,
        producto_id,
        marca_id,
        numero_lote,
        fecha_ingreso,
        fecha_vencimiento,
        anio_compra,
        cantidad_inicial,
        observaciones,
        created_at,

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
      `)
      .eq('producto_id', productoId)
      .order('fecha_vencimiento', {
        ascending: true,
      });

    if (error) {
      throw new BadRequestException(
        `Error obteniendo lotes del producto: ${error.message}`,
      );
    }

    return data;
  }

  async crear(dto: CrearLoteDto) {
    // Verificar producto
    const { data: producto, error: productoError } =
      await this.supabase
        .from('productos')
        .select('id')
        .eq('id', dto.producto_id)
        .maybeSingle();

    if (productoError) {
      throw new BadRequestException(
        `Error verificando producto: ${productoError.message}`,
      );
    }

    if (!producto) {
      throw new BadRequestException(
        `El producto ${dto.producto_id} no existe.`,
      );
    }

    // Verificar marca si fue enviada
    if (dto.marca_id !== undefined) {
      const { data: marca, error: marcaError } =
        await this.supabase
          .from('marcas')
          .select('id')
          .eq('id', dto.marca_id)
          .maybeSingle();

      if (marcaError) {
        throw new BadRequestException(
          `Error verificando marca: ${marcaError.message}`,
        );
      }

      if (!marca) {
        throw new BadRequestException(
          `La marca ${dto.marca_id} no existe.`,
        );
      }
    }

    // Verificar fecha de vencimiento
    const fechaIngreso = new Date(
      dto.fecha_ingreso,
    );

    const fechaVencimiento = new Date(
      dto.fecha_vencimiento,
    );

    if (fechaVencimiento <= fechaIngreso) {
      throw new BadRequestException(
        'La fecha de vencimiento debe ser posterior a la fecha de ingreso.',
      );
    }

    // Verificar si ya existe el mismo lote para el producto
    const { data: loteExistente } =
      await this.supabase
        .from('lotes')
        .select('id')
        .eq('producto_id', dto.producto_id)
        .eq('numero_lote', dto.numero_lote)
        .maybeSingle();

    if (loteExistente) {
      throw new BadRequestException(
        `Ya existe el lote ${dto.numero_lote} para este producto.`,
      );
    }

    const { data, error } = await this.supabase
      .from('lotes')
      .insert({
        producto_id: dto.producto_id,
        marca_id: dto.marca_id ?? null,
        numero_lote: dto.numero_lote,
        fecha_ingreso: dto.fecha_ingreso,
        fecha_vencimiento: dto.fecha_vencimiento,
        anio_compra: dto.anio_compra ?? null,
        cantidad_inicial: dto.cantidad_inicial,
        observaciones: dto.observaciones ?? null,
      })
      .select(`
        id,
        producto_id,
        marca_id,
        numero_lote,
        fecha_ingreso,
        fecha_vencimiento,
        anio_compra,
        cantidad_inicial,
        observaciones,
        created_at,

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
      `)
      .single();

    if (error) {
      throw new BadRequestException(
        `Error creando lote: ${error.message}`,
      );
    }

    return data;
  }

  async actualizar(
    id: number,
    dto: ActualizarLoteDto,
  ) {
    const loteActual = await this.obtenerPorId(id);

    const productoId =
      dto.producto_id ?? loteActual.producto_id;

    const marcaId =
      dto.marca_id ?? loteActual.marca_id;

    // Verificar producto
    if (dto.producto_id !== undefined) {
      const { data: producto } = await this.supabase
        .from('productos')
        .select('id')
        .eq('id', dto.producto_id)
        .maybeSingle();

      if (!producto) {
        throw new BadRequestException(
          `El producto ${dto.producto_id} no existe.`,
        );
      }
    }

    // Verificar marca
    if (
      dto.marca_id !== undefined &&
      dto.marca_id !== null
    ) {
      const { data: marca } = await this.supabase
        .from('marcas')
        .select('id')
        .eq('id', dto.marca_id)
        .maybeSingle();

      if (!marca) {
        throw new BadRequestException(
          `La marca ${dto.marca_id} no existe.`,
        );
      }
    }

    // Verificar fechas
    const fechaIngreso = new Date(
      dto.fecha_ingreso ??
        loteActual.fecha_ingreso,
    );

    const fechaVencimiento = new Date(
      dto.fecha_vencimiento ??
        loteActual.fecha_vencimiento,
    );

    if (fechaVencimiento <= fechaIngreso) {
      throw new BadRequestException(
        'La fecha de vencimiento debe ser posterior a la fecha de ingreso.',
      );
    }

    // Evitar duplicar número de lote
    if (dto.numero_lote) {
      const { data: loteExistente } =
        await this.supabase
          .from('lotes')
          .select('id')
          .eq('producto_id', productoId)
          .eq('numero_lote', dto.numero_lote)
          .neq('id', id)
          .maybeSingle();

      if (loteExistente) {
        throw new BadRequestException(
          `Ya existe el lote ${dto.numero_lote} para este producto.`,
        );
      }
    }

    const { data, error } = await this.supabase
      .from('lotes')
      .update(dto)
      .eq('id', id)
      .select(`
        id,
        producto_id,
        marca_id,
        numero_lote,
        fecha_ingreso,
        fecha_vencimiento,
        anio_compra,
        cantidad_inicial,
        observaciones,
        created_at,

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
      `)
      .single();

    if (error) {
      throw new BadRequestException(
        `Error actualizando lote: ${error.message}`,
      );
    }

    return data;
  }
}