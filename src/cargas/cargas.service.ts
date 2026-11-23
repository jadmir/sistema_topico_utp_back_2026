
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as XLSX from 'xlsx';
import { SupabaseService } from '../supabase/supabase.service.js';

interface AlumnoExcel {
  CODIGO_ALUMNO_PS: string;
  NOMBRE_COMPLETO: string;
  DNI: string;
  Carrera: string;
  CAMPUS: string;
}

interface FilaValidada {
  codigo: string;
  nombre: string;
  dni: string;
  carrera: string;
  campus: string;
}

@Injectable()
export class CargasService {
  private readonly TAMANO_LOTE = 1000;
  private readonly TIPO_ALUMNO_ID = 1;

  constructor(private readonly supabaseService: SupabaseService) {}

  private get supabase() {
    return this.supabaseService.getClient();
  }

  private leerExcel(buffer: Buffer): FilaValidada[] {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const nombreHoja = workbook.SheetNames[0];

    if (!nombreHoja) {
      throw new BadRequestException('El Excel no contiene hojas.');
    }

    const filas = XLSX.utils.sheet_to_json<AlumnoExcel>(
      workbook.Sheets[nombreHoja],
      { defval: '', raw: false },
    );

    if (!filas.length) {
      throw new BadRequestException('El Excel no contiene registros.');
    }

    const requeridas = [
      'CODIGO_ALUMNO_PS',
      'NOMBRE_COMPLETO',
      'DNI',
      'Carrera',
      'CAMPUS',
    ];

    const encabezados = XLSX.utils.sheet_to_json<Record<string, unknown>>(
      workbook.Sheets[nombreHoja],
      { header: 1, range: 0, defval: '' },
    )[0] as unknown as string[];

    const faltantes = requeridas.filter(
      (columna) => !encabezados?.includes(columna),
    );

    if (faltantes.length) {
      throw new BadRequestException(
        `Faltan columnas obligatorias: ${faltantes.join(', ')}`,
      );
    }

    const resultado: FilaValidada[] = [];
    const errores: string[] = [];
    const dnisVistos = new Set<string>();

    filas.forEach((fila, indice) => {
      const filaExcel = indice + 2;
      const codigo = String(fila.CODIGO_ALUMNO_PS ?? '').trim();
      const nombre = String(fila.NOMBRE_COMPLETO ?? '').trim();
      const dni = String(fila.DNI ?? '').trim();
      const carrera = String(fila.Carrera ?? '').trim();
      const campus = String(fila.CAMPUS ?? '').trim();

      if (!codigo || !nombre || !dni || !carrera || !campus) {
        errores.push(`Fila ${filaExcel}: hay campos obligatorios vacíos.`);
        return;
      }

      if (!/^\d{8}$/.test(dni)) {
        errores.push(`Fila ${filaExcel}: el DNI debe tener 8 dígitos.`);
        return;
      }

      if (dnisVistos.has(dni)) {
        errores.push(`Fila ${filaExcel}: DNI duplicado ${dni}.`);
        return;
      }

      dnisVistos.add(dni);
      resultado.push({ codigo, nombre, dni, carrera, campus });
    });

    if (errores.length) {
      throw new BadRequestException({
        mensaje: 'El Excel contiene errores. No se ha importado.',
        cantidadErrores: errores.length,
        errores: errores.slice(0, 100),
      });
    }

    return resultado;
  }

  async validarExcel(buffer: Buffer, periodo: string) {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(periodo)) {
      throw new BadRequestException('El periodo debe tener formato YYYY-MM.');
    }

    const filas = this.leerExcel(buffer);

    const { data, error } = await this.supabase
      .from('cargas_excel')
      .select('id, estado')
      .eq('periodo', periodo)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(
        `Error consultando el periodo: ${error.message}`,
      );
    }

    return {
      periodo,
      registros: filas.length,
      puedeImportar: !data,
      cargaExistente: data,
      mensaje: data
        ? `El periodo ${periodo} ya tiene una carga registrada.`
        : 'El archivo pasó las validaciones.',
    };
  }

  async importarExcel(
    buffer: Buffer,
    nombreArchivo: string,
    periodo: string,
  ) {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(periodo)) {
      throw new BadRequestException('El periodo debe tener formato YYYY-MM.');
    }

    const filas = this.leerExcel(buffer);

    const { data: existente, error: errorPeriodo } = await this.supabase
      .from('cargas_excel')
      .select('id')
      .eq('periodo', periodo)
      .maybeSingle();

    if (errorPeriodo) {
      throw new BadRequestException(errorPeriodo.message);
    }

    if (existente) {
      throw new BadRequestException(
        `El periodo ${periodo} ya fue cargado.`,
      );
    }

    const { data: carga, error: errorCarga } = await this.supabase
      .from('cargas_excel')
      .insert({
        nombre_archivo: nombreArchivo,
        periodo,
        registros_procesados: 0,
        registros_nuevos: 0,
        registros_actualizados: 0,
        registros_error: 0,
        estado: 'PROCESANDO',
        mensaje: null,
      })
      .select('id')
      .single();

    if (errorCarga || !carga) {
      throw new BadRequestException(
        `No se pudo crear la carga: ${errorCarga?.message ?? 'Error desconocido'}`,
      );
    }

    let nuevos = 0;
    let actualizados = 0;
    let procesados = 0;

    try {
      for (let inicio = 0; inicio < filas.length; inicio += this.TAMANO_LOTE) {
        const lote = filas.slice(inicio, inicio + this.TAMANO_LOTE);

        for (const fila of lote) {
          // Buscar personas por DNI. El DNI no tiene índice único,
          // por lo que se comprueba que no existan varias coincidencias.
          const { data: personas, error: errorPersona } = await this.supabase
            .from('personas')
            .select('id, tipo_persona_id')
            .eq('dni', fila.dni)
            .limit(2);

          if (errorPersona) {
            throw new Error(`DNI ${fila.dni}: ${errorPersona.message}`);
          }

          if ((personas ?? []).length > 1) {
            throw new Error(
              `El DNI ${fila.dni} aparece en varias personas. Se requiere revisión.`,
            );
          }

          let personaId: number;
          let esNuevo = false;

          if (personas?.length === 1) {
            personaId = personas[0].id;

            const { error } = await this.supabase
              .from('personas')
              .update({
                nombres: fila.nombre,
                tipo_persona_id: this.TIPO_ALUMNO_ID,
                updated_at: new Date().toISOString(),
              })
              .eq('id', personaId);

            if (error) {
              throw new Error(`Actualizando DNI ${fila.dni}: ${error.message}`);
            }
          } else {
            const { data: persona, error } = await this.supabase
              .from('personas')
              .insert({
                tipo_persona_id: this.TIPO_ALUMNO_ID,
                dni: fila.dni,
                nombres: fila.nombre,
                activo: true,
              })
              .select('id')
              .single();

            if (error || !persona) {
              throw new Error(
                `Creando persona ${fila.dni}: ${error?.message ?? 'Sin resultado'}`,
              );
            }

            personaId = persona.id;
            esNuevo = true;
          }

          // Una persona solo puede tener un registro en alumnos_nuevo.
          const { data: alumnoExistente, error: errorAlumno } =
            await this.supabase
              .from('alumnos_nuevo')
              .select('id, codigo_alumno')
              .eq('persona_id', personaId)
              .maybeSingle();

          if (errorAlumno) {
            throw new Error(
              `Buscando alumno ${fila.dni}: ${errorAlumno.message}`,
            );
          }

          // Evitar que el código de otro alumno se reasigne accidentalmente.
          const { data: codigoExistente, error: errorCodigo } =
            await this.supabase
              .from('alumnos_nuevo')
              .select('id, persona_id')
              .eq('codigo_alumno', fila.codigo)
              .maybeSingle();

          if (errorCodigo) {
            throw new Error(errorCodigo.message);
          }

          if (
            codigoExistente &&
            codigoExistente.persona_id !== personaId
          ) {
            throw new Error(
              `El código ${fila.codigo} ya pertenece a otro alumno.`,
            );
          }

          if (alumnoExistente) {
            const { error } = await this.supabase
              .from('alumnos_nuevo')
              .update({
                codigo_alumno: fila.codigo,
                carrera: fila.carrera,
                campus: fila.campus,
                estado: 'ACTIVO',
                updated_at: new Date().toISOString(),
              })
              .eq('id', alumnoExistente.id);

            if (error) {
              throw new Error(`Actualizando alumno: ${error.message}`);
            }

            actualizados++;
          } else {
            const { error } = await this.supabase
              .from('alumnos_nuevo')
              .insert({
                persona_id: personaId,
                codigo_alumno: fila.codigo,
                carrera: fila.carrera,
                campus: fila.campus,
                estado: 'ACTIVO',
              });

            if (error) {
              throw new Error(`Creando alumno: ${error.message}`);
            }

            nuevos++;
          }

          const { data: alumnoGuardado, error: errorAlumnoGuardado } =
            await this.supabase
              .from('alumnos_nuevo')
              .select('id')
              .eq('persona_id', personaId)
              .single();

          if (errorAlumnoGuardado || !alumnoGuardado) {
            throw new Error(
              `No se pudo recuperar el alumno: ${errorAlumnoGuardado?.message}`,
            );
          }

          const { error: errorSeguro } = await this.supabase
            .from('seguros_nuevo')
            .insert({
              alumno_id: alumnoGuardado.id,
              carga_id: carga.id,
              estado: 'ASEGURADO',
            });

          if (errorSeguro) {
            throw new Error(
              `Registrando PSE para DNI ${fila.dni}: ${errorSeguro.message}`,
            );
          }

          procesados++;
        }
      }

      const { error: errorFinal } = await this.supabase
        .from('cargas_excel')
        .update({
          registros_procesados: procesados,
          registros_nuevos: nuevos,
          registros_actualizados: actualizados,
          registros_error: 0,
          estado: 'COMPLETADO',
          mensaje: null,
        })
        .eq('id', carga.id);

      if (errorFinal) {
        throw new Error(`Finalizando carga: ${errorFinal.message}`);
      }

      return {
        cargaId: carga.id,
        periodo,
        registrosProcesados: procesados,
        registrosNuevos: nuevos,
        registrosActualizados: actualizados,
        registrosError: 0,
        estado: 'COMPLETADO',
      };
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : 'Error desconocido';

      await this.supabase
        .from('cargas_excel')
        .update({
          registros_procesados: procesados,
          registros_nuevos: nuevos,
          registros_actualizados: actualizados,
          registros_error: filas.length - procesados,
          estado: 'ERROR',
          mensaje,
        })
        .eq('id', carga.id);

      throw new BadRequestException({
        mensaje: 'La importación se interrumpió. Revisa el historial de cargas.',
        cargaId: carga.id,
        periodo,
        registrosProcesados: procesados,
        detalle: mensaje,
      });
    }
  }

  async obtenerCargas() {
    const { data, error } = await this.supabase
      .from('cargas_excel')
      .select(`
        id,
        nombre_archivo,
        periodo,
        fecha_carga,
        registros_procesados,
        registros_nuevos,
        registros_actualizados,
        registros_error,
        estado,
        mensaje
      `)
      .order('periodo', { ascending: false });

    if (error) {
      throw new BadRequestException(
        `Error obteniendo historial: ${error.message}`,
      );
    }

    return data ?? [];
  }

  async obtenerCargaPorId(id: number) {
    const { data, error } = await this.supabase
      .from('cargas_excel')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(error.message);
    }

    if (!data) {
      throw new NotFoundException(`No existe la carga ${id}.`);
    }

    return data;
  }
}
