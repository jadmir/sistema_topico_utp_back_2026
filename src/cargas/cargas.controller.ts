import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { CargasService } from './cargas.service.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { Permissions } from '../auth/decorators/permissions.decorator.js';

@Controller('cargas')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CargasController {
  constructor(
    private readonly cargasService: CargasService,
  ) {}

  // ==========================================
  // VALIDAR ARCHIVO EXCEL
  // POST /api/cargas/validar
  // Permiso: CARGAS:CREAR
  // ==========================================

  @Post('validar')
  @Permissions('CARGAS:CREAR')
  @UseInterceptors(
    FileInterceptor('archivo', {
      storage: memoryStorage(),
      limits: {
        fileSize: 20 * 1024 * 1024,
      },
      fileFilter: (_req, file, callback) => {
        const extension = file.originalname
          .split('.')
          .pop()
          ?.toLowerCase();

        if (!['xlsx', 'xls'].includes(extension ?? '')) {
          return callback(
            new BadRequestException(
              'Solo se permiten archivos Excel .xlsx o .xls.',
            ),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  async validarExcel(
    @UploadedFile() archivo: Express.Multer.File,
    @Body('periodo') periodo: string,
  ) {
    if (!archivo) {
      throw new BadRequestException(
        'Debes adjuntar un archivo Excel.',
      );
    }

    if (!periodo) {
      throw new BadRequestException(
        'Debes indicar el periodo de la carga.',
      );
    }

    return this.cargasService.validarExcel(
      archivo.buffer,
      periodo,
    );
  }

  // ==========================================
  // IMPORTAR ARCHIVO EXCEL
  // POST /api/cargas/importar
  // Permiso: CARGAS:CREAR
  // ==========================================

  @Post('importar')
  @Permissions('CARGAS:CREAR')
  @UseInterceptors(
    FileInterceptor('archivo', {
      storage: memoryStorage(),
      limits: {
        fileSize: 20 * 1024 * 1024,
      },
      fileFilter: (_req, file, callback) => {
        const extension = file.originalname
          .split('.')
          .pop()
          ?.toLowerCase();

        if (!['xlsx', 'xls'].includes(extension ?? '')) {
          return callback(
            new BadRequestException(
              'Solo se permiten archivos Excel .xlsx o .xls.',
            ),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  async importarExcel(
    @UploadedFile() archivo: Express.Multer.File,
    @Body('periodo') periodo: string,
  ) {
    if (!archivo) {
      throw new BadRequestException(
        'Debes adjuntar un archivo Excel.',
      );
    }

    if (!periodo) {
      throw new BadRequestException(
        'Debes indicar el periodo de la carga.',
      );
    }

    return this.cargasService.importarExcel(
      archivo.buffer,
      archivo.originalname,
      periodo,
    );
  }

  // ==========================================
  // HISTORIAL DE CARGAS
  // GET /api/cargas
  // Permiso: CARGAS:VER
  // ==========================================

  @Get()
  @Permissions('CARGAS:VER')
  async obtenerCargas() {
    return this.cargasService.obtenerCargas();
  }

  // ==========================================
  // DETALLE DE UNA CARGA
  // GET /api/cargas/:id
  // Permiso: CARGAS:VER
  // ==========================================

  @Get(':id')
  @Permissions('CARGAS:VER')
  async obtenerCargaPorId(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cargasService.obtenerCargaPorId(id);
  }
}
