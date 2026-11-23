import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { SupabaseService } from '../../supabase/supabase.service.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new Error('JWT_SECRET no está configurado');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: {
    sub: number;
    correo: string;
    rol_id: number;
  }) {
    const { data: usuario, error } =
      await this.supabaseService
        .getClient()
        .from('usuarios')
        .select(`
          id,
          rol_id,
          nombres,
          apellidos,
          correo,
          activo,
          roles (
            id,
            nombre,
            descripcion
          )
        `)
        .eq('id', payload.sub)
        .maybeSingle();

    if (error || !usuario) {
      throw new UnauthorizedException(
        'Usuario no encontrado',
      );
    }

    if (!usuario.activo) {
      throw new UnauthorizedException(
        'El usuario está desactivado',
      );
    }

    return usuario;
  }
}