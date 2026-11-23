import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { SupabaseService } from '../supabase/supabase.service.js';
import { CrearUsuarioDto } from '../personas/dto/crear-usuario.dto.js'; 
import { ActualizarUsuarioDto } from '../personas/dto/actualizar-usuario.dto.js'; 

@Injectable()
export class UsuariosService {
  constructor(
    private readonly supabaseService: SupabaseService,
  ) {}

  private get supabase() {
    return this.supabaseService.getClient();
  }

  async listar() {
    const { data, error } = await this.supabase
      .from('usuarios')
      .select(`
        id,
        rol_id,
        nombres,
        apellidos,
        correo,
        activo,
        created_at,
        roles (
          id,
          nombre,
          descripcion
        )
      `)
      .order('id', { ascending: true });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async obtenerPorId(id: number) {
    const { data, error } = await this.supabase
      .from('usuarios')
      .select(`
        id,
        rol_id,
        nombres,
        apellidos,
        correo,
        activo,
        created_at,
        roles (
          id,
          nombre,
          descripcion
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(error.message);
    }

    if (!data) {
      throw new NotFoundException(
        `No se encontró el usuario ${id}`,
      );
    }

    return data;
  }

  async crear(dto: CrearUsuarioDto) {
    // Verificar rol
    const { data: rol, error: errorRol } =
      await this.supabase
        .from('roles')
        .select('id, nombre, activo')
        .eq('id', dto.rol_id)
        .maybeSingle();

    if (errorRol) {
      throw new BadRequestException(errorRol.message);
    }

    if (!rol) {
      throw new NotFoundException(
        `No se encontró el rol ${dto.rol_id}`,
      );
    }

    if (!rol.activo) {
      throw new BadRequestException(
        'El rol seleccionado está inactivo',
      );
    }

    // Verificar correo
    const { data: usuarioExistente } =
      await this.supabase
        .from('usuarios')
        .select('id')
        .eq('correo', dto.correo)
        .maybeSingle();

    if (usuarioExistente) {
      throw new BadRequestException(
        'Ya existe un usuario con ese correo',
      );
    }

    // Encriptar contraseña
    const passwordHash = await bcrypt.hash(
      dto.password,
      10,
    );

    const { data, error } = await this.supabase
      .from('usuarios')
      .insert({
        rol_id: dto.rol_id,
        nombres: dto.nombres,
        apellidos: dto.apellidos ?? null,
        correo: dto.correo,
        password_hash: passwordHash,
        activo: true,
      })
      .select(`
        id,
        rol_id,
        nombres,
        apellidos,
        correo,
        activo,
        created_at
      `)
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      mensaje: 'Usuario creado correctamente',
      usuario: data,
    };
  }

  async actualizar(
    id: number,
    dto: ActualizarUsuarioDto,
  ) {
    await this.obtenerPorId(id);

    const datos: Record<string, unknown> = {};

    if (dto.rol_id !== undefined) {
      const { data: rol } = await this.supabase
        .from('roles')
        .select('id, activo')
        .eq('id', dto.rol_id)
        .maybeSingle();

      if (!rol) {
        throw new NotFoundException(
          `No se encontró el rol ${dto.rol_id}`,
        );
      }

      if (!rol.activo) {
        throw new BadRequestException(
          'El rol seleccionado está inactivo',
        );
      }

      datos.rol_id = dto.rol_id;
    }

    if (dto.nombres !== undefined) {
      datos.nombres = dto.nombres;
    }

    if (dto.apellidos !== undefined) {
      datos.apellidos = dto.apellidos;
    }

    if (dto.correo !== undefined) {
      const { data: existente } =
        await this.supabase
          .from('usuarios')
          .select('id')
          .eq('correo', dto.correo)
          .neq('id', id)
          .maybeSingle();

      if (existente) {
        throw new BadRequestException(
          'El correo ya está siendo utilizado',
        );
      }

      datos.correo = dto.correo;
    }

    if (dto.password !== undefined) {
      datos.password_hash = await bcrypt.hash(
        dto.password,
        10,
      );
    }

    const { data, error } = await this.supabase
      .from('usuarios')
      .update(datos)
      .eq('id', id)
      .select(`
        id,
        rol_id,
        nombres,
        apellidos,
        correo,
        activo,
        created_at
      `)
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      mensaje: 'Usuario actualizado correctamente',
      usuario: data,
    };
  }

  async desactivar(id: number) {
    await this.obtenerPorId(id);

    const { data, error } = await this.supabase
      .from('usuarios')
      .update({
        activo: false,
      })
      .eq('id', id)
      .select(`
        id,
        rol_id,
        nombres,
        apellidos,
        correo,
        activo,
        created_at
      `)
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      mensaje: 'Usuario desactivado correctamente',
      usuario: data,
    };
  }
}