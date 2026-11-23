import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { SupabaseModule } from './supabase/supabase.module.js';
import { HealthController } from './health/health.controller.js';
import { PersonasModule } from './personas/personas.module.js';
import { AlumnosModule } from './alumnos/alumnos.module.js';
import { AlergiasModule } from './alergias/alergias.module.js';
import { AtencionesModule } from './atenciones/atenciones.module.js';
import { TriajesModule } from './triajes/triajes.module.js';
import { CategoriasModule } from './categorias/categorias.module.js';
import { ProductosModule } from './productos/productos.module.js';
import { MarcasModule } from './marcas/marcas.module.js';
import { LotesModule } from './lotes/lotes.module.js';
import { UbicacionesModule } from './ubicaciones/ubicaciones.module.js';
import { ExistenciasModule } from './existencias/existencias.module.js';
import { MovimientosInventarioModule } from './movimientos-inventario/movimientos-inventario.module.js';
import { DetalleAtencionesModule } from './detalle-atenciones/detalle-atenciones.module.js';
import { EstablecimientosModule } from './establecimientos/establecimientos.module.js';
import { DerivacionesModule } from './derivaciones/derivaciones.module.js';
import { CampaniasModule } from './campanias/campanias.module.js';
import { ParticipacionesCampaniaModule } from './participaciones-campania/participaciones-campania.module.js';
import { DonacionesSangreModule } from './donaciones-sangre/donaciones-sangre.module.js';
import { UsuariosModule } from './usuarios/usuarios.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ReportesModule } from './reportes/reportes.module.js';
import { CargasModule } from './cargas/cargas.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    SupabaseModule,
    PersonasModule,
    AlumnosModule,
    AlergiasModule,
    AtencionesModule,
    TriajesModule,
    CategoriasModule,
    ProductosModule,
    MarcasModule,
    LotesModule,
    UbicacionesModule,
    ExistenciasModule,
    MovimientosInventarioModule,
    DetalleAtencionesModule,
    EstablecimientosModule,
    DerivacionesModule,
    CampaniasModule,
    ParticipacionesCampaniaModule,
    DonacionesSangreModule,
    UsuariosModule,
    AuthModule,
    ReportesModule,
    CargasModule,
  ],

  controllers: [
    HealthController,
  ],
})
export class AppModule {}