import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { SupabaseService } from '../supabase/supabase.service.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly jwtService: JwtService,
  ) {}

  private get supabase() {
    return this.supabaseService.getClient();
  }

  async login(dto: LoginDto) {
    // 1. Buscar usuario
    const { data: usuario, error } = await this.supabase
      .from('usuarios')
      .select(`
        id,
        rol_id,
        nombres,
        apellidos,
        correo,
        password_hash,
        activo,
        roles (
          id,
          nombre,
          descripcion
        )
      `)
      .eq('correo', dto.correo)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(error.message);
    }

    if (!usuario) {
      throw new UnauthorizedException(
        'Correo o contraseña incorrectos',
      );
    }

    // 2. Verificar usuario activo
    if (!usuario.activo) {
      throw new UnauthorizedException(
        'El usuario está desactivado',
      );
    }

    // 3. Verificar contraseña
    const passwordCorrecta = await bcrypt.compare(
      dto.password,
      usuario.password_hash,
    );

    if (!passwordCorrecta) {
      throw new UnauthorizedException(
        'Correo o contraseña incorrectos',
      );
    }

    // 4. Crear payload
    const payload = {
      sub: usuario.id,
      correo: usuario.correo,
      rol_id: usuario.rol_id,
    };

    // 5. Generar token
    const accessToken = await this.jwtService.signAsync(
      payload,
    );

    // 6. No devolver password_hash
    return {
      mensaje: 'Login correcto',

      access_token: accessToken,

      usuario: {
        id: usuario.id,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        correo: usuario.correo,
        rol_id: usuario.rol_id,
        rol: usuario.roles,
      },
    };
  }
}