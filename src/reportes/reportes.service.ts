import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import * as XLSX from 'xlsx';

import { SupabaseService } from '../supabase/supabase.service.js';

@Injectable()
export class ReportesService {
  constructor(
    private readonly supabaseService: SupabaseService,
  ) {}

  private get supabase() {
    return this.supabaseService.getClient();
  }

  // ==========================================
  // RESUMEN GENERAL
  // ==========================================

  async resumenGeneral() {
    const [
      personas,
      alumnos,
      atenciones,
      productos,
      existencias,
      derivaciones,
      campanias,
    ] = await Promise.all([
      this.supabase
        .from('personas')
        .select('id', { count: 'exact', head: true }),

      this.supabase
        .from('alumnos_nuevo')
        .select('id', { count: 'exact', head: true }),

      this.supabase
        .from('atenciones')
        .select('id', { count: 'exact', head: true }),

      this.supabase
        .from('productos')
        .select('id', { count: 'exact', head: true }),

      this.supabase
        .from('existencias')
        .select('id, cantidad'),

      this.supabase
        .from('derivaciones')
        .select('id', { count: 'exact', head: true }),

      this.supabase
        .from('campanias')
        .select('id', { count: 'exact', head: true }),
    ]);

    const errores = [
      personas.error,
      alumnos.error,
      atenciones.error,
      productos.error,
      existencias.error,
      derivaciones.error,
      campanias.error,
    ].filter(Boolean);

    if (errores.length > 0) {
      throw new BadRequestException(
        errores[0]?.message ?? 'Error al generar el resumen',
      );
    }

    const stockTotal = (existencias.data ?? []).reduce(
      (total, existencia) =>
        total + Number(existencia.cantidad ?? 0),
      0,
    );

    return {
      personas: personas.count ?? 0,
      alumnos: alumnos.count ?? 0,
      atenciones: atenciones.count ?? 0,
      productos: productos.count ?? 0,
      stock_total: stockTotal,
      derivaciones: derivaciones.count ?? 0,
      campanias: campanias.count ?? 0,
    };
  }

  // ==========================================
  // RESUMEN DE ATENCIONES
  // ==========================================

  async resumenAtenciones() {
    const { data, error } = await this.supabase
      .from('atenciones')
      .select(
        'id, persona_id, fecha_hora, turno, motivo_atencion, diagnostico, estado, estado_pse',
      )
      .order('fecha_hora', { ascending: false });

    if (error) {
      throw new BadRequestException(error.message);
    }

    const total = data?.length ?? 0;

    const abiertas =
      data?.filter(
        (item) => item.estado === 'ABIERTA',
      ).length ?? 0;

    const cerradas =
      data?.filter(
        (item) => item.estado === 'CERRADA',
      ).length ?? 0;

    const canceladas =
      data?.filter(
        (item) => item.estado === 'CANCELADA',
      ).length ?? 0;

    const asegurados =
      data?.filter(
        (item) => item.estado_pse === 'ASEGURADO',
      ).length ?? 0;

    const noVerificados =
      data?.filter(
        (item) => item.estado_pse === 'NO_VERIFICADO',
      ).length ?? 0;

    return {
      total,
      abiertas,
      cerradas,
      canceladas,
      asegurados,
      pse_no_verificado: noVerificados,
      atenciones: data ?? [],
    };
  }

  // ==========================================
  // RESUMEN DE INVENTARIO
  // ==========================================

  async resumenInventario() {
    const { data, error } = await this.supabase
      .from('existencias')
      .select(`
        id,
        lote_id,
        ubicacion_id,
        cantidad,
        stock_minimo,
        lotes (
          id,
          numero_lote,
          fecha_vencimiento,
          productos (
            id,
            codigo,
            nombre
          ),
          marcas (
            id,
            nombre
          )
        ),
        ubicaciones (
          id,
          nombre
        )
      `);

    if (error) {
      throw new BadRequestException(error.message);
    }

    const existencias = data ?? [];

    const stockTotal = existencias.reduce(
      (total, item) =>
        total + Number(item.cantidad ?? 0),
      0,
    );

    const stockBajo = existencias.filter(
      (item) =>
        Number(item.cantidad ?? 0) <=
        Number(item.stock_minimo ?? 0),
    );

    const hoy = new Date();

    const proximosVencer = existencias.filter(
      (item: any) => {
        const fecha =
          item.lotes?.fecha_vencimiento;

        if (!fecha) {
          return false;
        }

        const vencimiento = new Date(fecha);

        const diferencia =
          vencimiento.getTime() -
          hoy.getTime();

        const dias =
          diferencia /
          (1000 * 60 * 60 * 24);

        return dias >= 0 && dias <= 90;
      },
    );

    return {
      stock_total: stockTotal,
      ubicaciones_con_stock: existencias.length,
      stock_bajo: stockBajo,
      proximos_vencer: proximosVencer,
    };
  }

  // ==========================================
  // INVENTARIO COMPLETO
  // ==========================================

  async inventarioCompleto() {
    const { data: existencias, error } =
      await this.supabase
        .from('existencias')
        .select(`
          id,
          lote_id,
          ubicacion_id,
          cantidad,
          stock_minimo,
          updated_at
        `)
        .order('id', { ascending: true });

    if (error) {
      throw new BadRequestException(error.message);
    }

    if (!existencias || existencias.length === 0) {
      return [];
    }

    // ------------------------------------------
    // IDs DE LOTES Y UBICACIONES
    // ------------------------------------------

    const loteIds = [
      ...new Set(
        existencias.map(
          (item) => item.lote_id,
        ),
      ),
    ];

    const ubicacionIds = [
      ...new Set(
        existencias.map(
          (item) => item.ubicacion_id,
        ),
      ),
    ];

    // ------------------------------------------
    // LOTES
    // ------------------------------------------

    const { data: lotes, error: errorLotes } =
      await this.supabase
        .from('lotes')
        .select(`
          id,
          numero_lote,
          fecha_ingreso,
          fecha_vencimiento,
          anio_compra,
          cantidad_inicial,
          producto_id,
          marca_id
        `)
        .in('id', loteIds);

    if (errorLotes) {
      throw new BadRequestException(
        errorLotes.message,
      );
    }

    // ------------------------------------------
    // IDs DE PRODUCTOS
    // ------------------------------------------

    const productoIds = [
      ...new Set(
        (lotes ?? [])
          .map((lote) => lote.producto_id)
          .filter(Boolean),
      ),
    ];

    // ------------------------------------------
    // IDs DE MARCAS
    // ------------------------------------------

    const marcaIds = [
      ...new Set(
        (lotes ?? [])
          .map((lote) => lote.marca_id)
          .filter(Boolean),
      ),
    ];

    // ------------------------------------------
    // PRODUCTOS
    // ------------------------------------------

    let productos: any[] = [];

    if (productoIds.length > 0) {
      const {
        data,
        error: errorProductos,
      } = await this.supabase
        .from('productos')
        .select(`
          id,
          codigo,
          nombre,
          presentacion,
          unidad_medida,
          tipo,
          necesidad,
          categoria_id
        `)
        .in('id', productoIds);

      if (errorProductos) {
        throw new BadRequestException(
          errorProductos.message,
        );
      }

      productos = data ?? [];
    }

    // ------------------------------------------
    // MARCAS
    // ------------------------------------------

    let marcas: any[] = [];

    if (marcaIds.length > 0) {
      const {
        data,
        error: errorMarcas,
      } = await this.supabase
        .from('marcas')
        .select('id, nombre')
        .in('id', marcaIds);

      if (errorMarcas) {
        throw new BadRequestException(
          errorMarcas.message,
        );
      }

      marcas = data ?? [];
    }

    // ------------------------------------------
    // UBICACIONES
    // ------------------------------------------

    let ubicaciones: any[] = [];

    if (ubicacionIds.length > 0) {
      const {
        data,
        error: errorUbicaciones,
      } = await this.supabase
        .from('ubicaciones')
        .select('id, nombre, tipo')
        .in('id', ubicacionIds);

      if (errorUbicaciones) {
        throw new BadRequestException(
          errorUbicaciones.message,
        );
      }

      ubicaciones = data ?? [];
    }

    // ------------------------------------------
    // MAPAS PARA RELACIONAR INFORMACIÓN
    // ------------------------------------------

    const lotesMap = new Map(
      (lotes ?? []).map(
        (item) => [item.id, item],
      ),
    );

    const productosMap = new Map(
      productos.map(
        (item) => [item.id, item],
      ),
    );

    const marcasMap = new Map(
      marcas.map(
        (item) => [item.id, item],
      ),
    );

    const ubicacionesMap = new Map(
      ubicaciones.map(
        (item) => [item.id, item],
      ),
    );

    // ------------------------------------------
    // CONSTRUIR INVENTARIO FINAL
    // ------------------------------------------

    return existencias.map((existencia) => {
      const lote = lotesMap.get(
        existencia.lote_id,
      );

      const producto = lote
        ? productosMap.get(
            lote.producto_id,
          )
        : null;

      const marca = lote?.marca_id
        ? marcasMap.get(lote.marca_id)
        : null;

      const ubicacion =
        ubicacionesMap.get(
          existencia.ubicacion_id,
        );

      return {
        existencia_id: existencia.id,

        producto: producto
          ? {
              id: producto.id,
              codigo: producto.codigo,
              nombre: producto.nombre,
              presentacion:
                producto.presentacion,
              unidad_medida:
                producto.unidad_medida,
              tipo: producto.tipo,
              necesidad: producto.necesidad,
            }
          : null,

        marca: marca
          ? {
              id: marca.id,
              nombre: marca.nombre,
            }
          : null,

        lote: lote
          ? {
              id: lote.id,
              numero_lote:
                lote.numero_lote,
              fecha_ingreso:
                lote.fecha_ingreso,
              fecha_vencimiento:
                lote.fecha_vencimiento,
              anio_compra:
                lote.anio_compra,
              cantidad_inicial:
                lote.cantidad_inicial,
            }
          : null,

        ubicacion: ubicacion
          ? {
              id: ubicacion.id,
              nombre: ubicacion.nombre,
              tipo: ubicacion.tipo,
            }
          : null,

        stock: Number(
          existencia.cantidad,
        ),

        stock_minimo: Number(
          existencia.stock_minimo,
        ),

        stock_bajo:
          Number(existencia.cantidad) <=
          Number(existencia.stock_minimo),

        updated_at:
          existencia.updated_at,
      };
    });
  }

  // ==========================================
  // ENTRADAS DE INVENTARIO
  // ==========================================

  async entradasInventario() {
    const { data, error } =
      await this.supabase
        .from('movimientos_inventario')
        .select(`
          id,
          lote_id,
          ubicacion_origen_id,
          ubicacion_destino_id,
          usuario_id,
          tipo_movimiento,
          cantidad,
          motivo,
          fecha,
          observaciones,
          atencion_id
        `)
        .eq(
          'tipo_movimiento',
          'ENTRADA',
        )
        .order('fecha', {
          ascending: false,
        });

    if (error) {
      throw new BadRequestException(
        error.message,
      );
    }

    return data ?? [];
  }

  // ==========================================
  // SALIDAS DE INVENTARIO
  // ==========================================

  async salidasInventario() {
    const { data, error } =
      await this.supabase
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
        .eq(
          'tipo_movimiento',
          'SALIDA',
        )
        .order('fecha', {
          ascending: false,
        });

    if (error) {
      throw new BadRequestException(
        error.message,
      );
    }

    return data ?? [];
  }

  // ==========================================
  // DERIVACIONES
  // ==========================================

  async resumenDerivaciones() {
    const { data, error } =
      await this.supabase
        .from('derivaciones')
        .select(
          'id, atencion_id, establecimiento_id, estado, tipo_traslado, fecha_creacion',
        )
        .order('id', {
          ascending: false,
        });

    if (error) {
      throw new BadRequestException(
        error.message,
      );
    }

    const derivaciones = data ?? [];

    return {
      total: derivaciones.length,

      pendientes:
        derivaciones.filter(
          (item) =>
            item.estado ===
            'PENDIENTE',
        ).length,

      coordinadas:
        derivaciones.filter(
          (item) =>
            item.estado ===
            'COORDINADO',
        ).length,

      trasladadas:
        derivaciones.filter(
          (item) =>
            item.estado ===
            'TRASLADADO',
        ).length,

      atendidas:
        derivaciones.filter(
          (item) =>
            item.estado ===
            'ATENDIDO',
        ).length,

      canceladas:
        derivaciones.filter(
          (item) =>
            item.estado ===
            'CANCELADO',
        ).length,

      derivaciones,
    };
  }

  // ==========================================
  // CAMPAÑAS
  // ==========================================

  async resumenCampanias() {
    const { data, error } =
      await this.supabase
        .from('campanias')
        .select(
          'id, nombre, tipo, fecha_inicio, fecha_fin, lugar, estado',
        )
        .order('id', {
          ascending: false,
        });

    if (error) {
      throw new BadRequestException(
        error.message,
      );
    }

    const campanias = data ?? [];

    return {
      total: campanias.length,

      planificadas:
        campanias.filter(
          (item) =>
            item.estado ===
            'PLANIFICADA',
        ).length,

      activas:
        campanias.filter(
          (item) =>
            item.estado ===
            'ACTIVA',
        ).length,

      finalizadas:
        campanias.filter(
          (item) =>
            item.estado ===
            'FINALIZADA',
        ).length,

      canceladas:
        campanias.filter(
          (item) =>
            item.estado ===
            'CANCELADA',
        ).length,

      campanias,
    };
  }

  
  // ==========================================
  // EXPORTAR INVENTARIO A EXCEL
  // ==========================================

  async exportarInventarioExcel(): Promise<Buffer> {
    const inventario = await this.inventarioCompleto();

    const filas = inventario.map((item: any) => ({
      'ID existencia': item.existencia_id,
      'Código producto': item.producto?.codigo ?? '',
      'Producto': item.producto?.nombre ?? '',
      'Presentación': item.producto?.presentacion ?? '',
      'Unidad de medida': item.producto?.unidad_medida ?? '',
      'Tipo': item.producto?.tipo ?? '',
      'Necesidad': item.producto?.necesidad ?? '',
      'Marca': item.marca?.nombre ?? '',
      'Número de lote': item.lote?.numero_lote ?? '',
      'Fecha de ingreso': item.lote?.fecha_ingreso ?? '',
      'Fecha de vencimiento': item.lote?.fecha_vencimiento ?? '',
      'Año de compra': item.lote?.anio_compra ?? '',
      'Cantidad inicial': item.lote?.cantidad_inicial ?? 0,
      'Ubicación': item.ubicacion?.nombre ?? '',
      'Tipo de ubicación': item.ubicacion?.tipo ?? '',
      'Stock actual': item.stock ?? 0,
      'Stock mínimo': item.stock_minimo ?? 0,
      'Stock bajo': item.stock_bajo ? 'SÍ' : 'NO',
      'Última actualización': item.updated_at ?? '',
    }));

    return this.generarExcel(filas, 'Inventario');
  }

  // ==========================================
  // EXPORTAR ENTRADAS A EXCEL
  // ==========================================

  async exportarEntradasExcel(): Promise<Buffer> {
    const movimientos = await this.entradasInventario();

    const filas = movimientos.map((item: any) => ({
      'ID movimiento': item.id,
      'Tipo de movimiento': item.tipo_movimiento,
      'ID lote': item.lote_id,
      'ID ubicación origen': item.ubicacion_origen_id ?? '',
      'ID ubicación destino': item.ubicacion_destino_id ?? '',
      'Cantidad': item.cantidad,
      'Motivo': item.motivo ?? '',
      'Fecha': item.fecha,
      'ID usuario': item.usuario_id ?? '',
      'Observaciones': item.observaciones ?? '',
    }));

    return this.generarExcel(filas, 'Entradas');
  }

  // ==========================================
  // EXPORTAR SALIDAS A EXCEL
  // ==========================================

  async exportarSalidasExcel(): Promise<Buffer> {
    const movimientos = await this.salidasInventario();

    const filas = movimientos.map((item: any) => ({
      'ID movimiento': item.id,
      'Tipo de movimiento': item.tipo_movimiento,
      'ID lote': item.lote_id,
      'ID ubicación origen': item.ubicacion_origen_id ?? '',
      'ID ubicación destino': item.ubicacion_destino_id ?? '',
      'ID atención': item.atencion_id ?? '',
      'Cantidad': item.cantidad,
      'Motivo': item.motivo ?? '',
      'Fecha': item.fecha,
      'ID usuario': item.usuario_id ?? '',
      'Observaciones': item.observaciones ?? '',
    }));

    return this.generarExcel(filas, 'Salidas');
  }

  // ==========================================
  // GENERADOR DE ARCHIVOS EXCEL
  // ==========================================

  private generarExcel(
    filas: Record<string, any>[],
    nombreHoja: string,
  ): Buffer {
    const libro = XLSX.utils.book_new();

    const hoja =
      filas.length > 0
        ? XLSX.utils.json_to_sheet(filas)
        : XLSX.utils.aoa_to_sheet([['Sin registros']]);

    XLSX.utils.book_append_sheet(libro, hoja, nombreHoja);

    return XLSX.write(libro, {
      bookType: 'xlsx',
      type: 'buffer',
    }) as Buffer;
  }

    // ==========================================
  // RESUMEN PARA EL DASHBOARD
  // ==========================================

  async resumenDashboard() {
    const ahora = new Date();

    // Inicio del mes actual
    const inicioMes = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      1,
    );

    // Inicio del mes siguiente
    const inicioMesSiguiente = new Date(
      ahora.getFullYear(),
      ahora.getMonth() + 1,
      1,
    );

    const [
      resumen,
      inventario,
      atencionesMes,
    ] = await Promise.all([
      this.resumenGeneral(),
      this.resumenInventario(),

      this.supabase
        .from('atenciones')
        .select('id', { count: 'exact', head: true })
        .gte('fecha_hora', inicioMes.toISOString())
        .lt('fecha_hora', inicioMesSiguiente.toISOString()),
    ]);

    if (atencionesMes.error) {
      throw new BadRequestException(
        atencionesMes.error.message,
      );
    }

    // Contar lotes únicos próximos a vencer
    const lotesPorVencer = new Set(
      (inventario.proximos_vencer as Array<{
        lote_id: number | string;
      }>)
        .map((item) => item.lote_id)
        .filter((id) => id != null),
    );

    return {
      personasRegistradas: resumen.personas,
      atencionesDelMes: atencionesMes.count ?? 0,
      productosRegistrados: resumen.productos,
      lotesPorVencer: lotesPorVencer.size,
    };
  }
}