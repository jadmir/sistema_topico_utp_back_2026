import {
  Controller,
  Get,
  UseGuards,
  StreamableFile,
} from '@nestjs/common';

import { ReportesService } from './reportes.service.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { Permissions } from '../auth/decorators/permissions.decorator.js';

@Controller('reportes')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ReportesController {
  constructor(
    private readonly reportesService: ReportesService,
  ) {}

  // ==========================================
  // RESUMEN GENERAL
  // ==========================================

  @Get('resumen-general')
  @Permissions('REPORTES:VER')
  resumenGeneral() {
    return this.reportesService.resumenGeneral();
  }

  // ==========================================
  // ATENCIONES
  // ==========================================

  @Get('atenciones')
  @Permissions('REPORTES:VER')
  resumenAtenciones() {
    return this.reportesService.resumenAtenciones();
  }

  // ==========================================
  // INVENTARIO COMPLETO
  // ==========================================

  @Get('inventario')
  @Permissions('REPORTES:VER')
  inventarioCompleto() {
    return this.reportesService.inventarioCompleto();
  }

  // ==========================================
  // RESUMEN DE INVENTARIO
  // ==========================================

  @Get('inventario/resumen')
  @Permissions('REPORTES:VER')
  resumenInventario() {
    return this.reportesService.resumenInventario();
  }

  // ==========================================
  // ENTRADAS DE INVENTARIO
  // ==========================================

  @Get('inventario/entradas')
  @Permissions('REPORTES:VER')
  entradasInventario() {
    return this.reportesService.entradasInventario();
  }

  // ==========================================
  // SALIDAS DE INVENTARIO
  // ==========================================

  @Get('inventario/salidas')
  @Permissions('REPORTES:VER')
  salidasInventario() {
    return this.reportesService.salidasInventario();
  }

  // ==========================================
  // DERIVACIONES
  // ==========================================

  @Get('derivaciones')
  @Permissions('REPORTES:VER')
  resumenDerivaciones() {
    return this.reportesService.resumenDerivaciones();
  }

  // ==========================================
  // CAMPAÑAS
  // ==========================================

  @Get('campanias')
  @Permissions('REPORTES:VER')
  resumenCampanias() {
    return this.reportesService.resumenCampanias();
  }

    // ==========================================
  // DASHBOARD
  // ==========================================

  @Get('dashboard')
  @Permissions('REPORTES:VER')
  resumenDashboard() {
    return this.reportesService.resumenDashboard();
  }

  
  @Get('inventario/exportar')
  @Permissions('REPORTES:VER')
  async exportarInventario(): Promise<StreamableFile> {
    const buffer = await this.reportesService.exportarInventarioExcel();

    return new StreamableFile(buffer, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition: 'attachment; filename="inventario.xlsx"',
    });
  }

  @Get('inventario/entradas/exportar')
  @Permissions('REPORTES:VER')
  async exportarEntradas(): Promise<StreamableFile> {
    const buffer = await this.reportesService.exportarEntradasExcel();

    return new StreamableFile(buffer, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition: 'attachment; filename="entradas_inventario.xlsx"',
    });
  }

  @Get('inventario/salidas/exportar')
  @Permissions('REPORTES:VER')
  async exportarSalidas(): Promise<StreamableFile> {
    const buffer = await this.reportesService.exportarSalidasExcel();

    return new StreamableFile(buffer, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition: 'attachment; filename="salidas_inventario.xlsx"',
    });
  }

}