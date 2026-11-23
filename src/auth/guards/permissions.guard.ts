import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import { SupabaseService } from '../../supabase/supabase.service.js';

import { PERMISSIONS_KEY } from '../decorators/permissions.decorator.js';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly supabaseService: SupabaseService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const requiredPermissions =
      this.reflector.getAllAndOverride<string[]>(
        PERMISSIONS_KEY,
        [
          context.getHandler(),
          context.getClass(),
        ],
      );

    // Si el endpoint no tiene permisos definidos,
    // no bloqueamos por este guard.
    if (
      !requiredPermissions ||
      requiredPermissions.length === 0
    ) {
      return true;
    }

    const request =
      context.switchToHttp().getRequest();

    const usuario = request.user;

    if (!usuario?.id) {
      throw new ForbiddenException(
        'Usuario no autenticado',
      );
    }

    const supabase =
      this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('usuario_permisos')
      .select(`
        permisos (
          modulos (
            nombre
          ),
          acciones (
            nombre
          )
        )
      `)
      .eq('usuario_id', usuario.id);

    if (error) {
      throw new ForbiddenException(
        'No se pudieron verificar los permisos del usuario',
      );
    }

    const permisosUsuario =
      (data ?? []).map((item: any) => {
        const permiso = item.permisos;

        const modulo = Array.isArray(permiso?.modulos)
          ? permiso.modulos[0]
          : permiso?.modulos;

        const accion = Array.isArray(permiso?.acciones)
          ? permiso.acciones[0]
          : permiso?.acciones;

        if (!modulo?.nombre || !accion?.nombre) {
          return null;
        }

        return `${modulo.nombre}:${accion.nombre}`;
      })
      .filter(Boolean);

    const tienePermiso =
      requiredPermissions.some(
        (requiredPermission) =>
          permisosUsuario.includes(
            requiredPermission,
          ),
      );

    if (!tienePermiso) {
      throw new ForbiddenException(
        'No tienes permisos para realizar esta operación',
      );
    }

    return true;
  }
}