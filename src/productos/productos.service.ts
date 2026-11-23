import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { SupabaseService } from '../supabase/supabase.service.js';

import { CrearProductoDto } from '../personas/dto/crear-producto.dto.js'; 
import { ActualizarProductoDto } from '../personas/dto/actualizar-producto.dto.js'; 


@Injectable()
export class ProductosService {
  constructor(
    private readonly supabaseService: SupabaseService,
  ) {}

  private get supabase() {
    return this.supabaseService.getClient();
  }

  async obtenerTodos() {
    const { data, error } = await this.supabase
      .from('productos')
      .select(`
        id,
        categoria_id,
        codigo,
        nombre,
        presentacion,
        unidad_medida,
        tipo,
        necesidad,
        activo,
        created_at,
        updated_at,
        categorias (
          id,
          nombre
        )
      `)
      .order('nombre', { ascending: true });

    if (error) {
      throw new BadRequestException(
        `Error obteniendo productos: ${error.message}`,
      );
    }

    return data;
  }

  async obtenerPorId(id: number) {
    const { data, error } = await this.supabase
      .from('productos')
      .select(`
        id,
        categoria_id,
        codigo,
        nombre,
        presentacion,
        unidad_medida,
        tipo,
        necesidad,
        activo,
        created_at,
        updated_at,
        categorias (
          id,
          nombre
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(
        `Error buscando producto: ${error.message}`,
      );
    }

    if (!data) {
      throw new NotFoundException(
        `No se encontró el producto ${id}.`,
      );
    }

    return data;
  }

  async obtenerPorCodigo(codigo: string) {
    const { data, error } = await this.supabase
      .from('productos')
      .select(`
        id,
        categoria_id,
        codigo,
        nombre,
        presentacion,
        unidad_medida,
        tipo,
        necesidad,
        activo,
        created_at,
        updated_at,
        categorias (
          id,
          nombre
        )
      `)
      .eq('codigo', codigo)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(
        `Error buscando producto: ${error.message}`,
      );
    }

    if (!data) {
      throw new NotFoundException(
        `No se encontró el producto con código ${codigo}.`,
      );
    }

    return data;
  }

  async crear(dto: CrearProductoDto) {
    const { data: categoria, error: categoriaError } =
      await this.supabase
        .from('categorias')
        .select('id')
        .eq('id', dto.categoria_id)
        .maybeSingle();

    if (categoriaError) {
      throw new BadRequestException(
        `Error verificando categoría: ${categoriaError.message}`,
      );
    }

    if (!categoria) {
      throw new BadRequestException(
        `La categoría ${dto.categoria_id} no existe.`,
      );
    }

    const { data: existente } = await this.supabase
      .from('productos')
      .select('id')
      .eq('codigo', dto.codigo)
      .maybeSingle();

    if (existente) {
      throw new BadRequestException(
        `Ya existe un producto con código ${dto.codigo}.`,
      );
    }

    const { data, error } = await this.supabase
      .from('productos')
      .insert({
        categoria_id: dto.categoria_id,
        codigo: dto.codigo,
        nombre: dto.nombre,
        presentacion: dto.presentacion ?? null,
        unidad_medida: dto.unidad_medida ?? null,
        tipo: dto.tipo ?? null,
        necesidad: dto.necesidad ?? null,
        activo: true,
      })
      .select(`
        id,
        categoria_id,
        codigo,
        nombre,
        presentacion,
        unidad_medida,
        tipo,
        necesidad,
        activo,
        created_at,
        updated_at,
        categorias (
          id,
          nombre
        )
      `)
      .single();

    if (error) {
      throw new BadRequestException(
        `Error creando producto: ${error.message}`,
      );
    }

    return data;
  }

  async actualizar(
    id: number,
    dto: ActualizarProductoDto,
  ) {
    await this.obtenerPorId(id);

    if (dto.categoria_id !== undefined) {
      const { data: categoria } = await this.supabase
        .from('categorias')
        .select('id')
        .eq('id', dto.categoria_id)
        .maybeSingle();

      if (!categoria) {
        throw new BadRequestException(
          `La categoría ${dto.categoria_id} no existe.`,
        );
      }
    }

    const { data, error } = await this.supabase
      .from('productos')
      .update({
        ...dto,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        id,
        categoria_id,
        codigo,
        nombre,
        presentacion,
        unidad_medida,
        tipo,
        necesidad,
        activo,
        created_at,
        updated_at,
        categorias (
          id,
          nombre
        )
      `)
      .single();

    if (error) {
      throw new BadRequestException(
        `Error actualizando producto: ${error.message}`,
      );
    }

    return data;
  }
}