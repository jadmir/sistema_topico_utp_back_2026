import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class CrearAtencionDto {
  @IsInt()
  persona_id: number;

  @IsOptional()
  @IsInt()
  usuario_id?: number;

  @IsOptional()
  @IsString()
  @IsIn(['MAÑANA', 'TARDE', 'NOCHE'])
  turno?: string;

  @IsString()
  motivo_atencion: string;

  @IsOptional()
  @IsString()
  sintomas?: string;

  @IsOptional()
  @IsString()
  antecedentes_patologicos?: string;

  @IsOptional()
  @IsDateString()
  fecha_inicio_sintomas?: string;

  @IsOptional()
  @IsString()
  diagnostico?: string;

  @IsOptional()
  @IsString()
  tratamiento?: string;

  @IsOptional()
  @IsString()
  indicaciones?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsIn(['ASEGURADO', 'NO_ASEGURADO', 'NO_VERIFICADO'])
  estado_pse?: string;
}