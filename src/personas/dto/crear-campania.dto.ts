import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CrearCampaniaDto {
  @IsString()
  @MaxLength(150)
  nombre: string;

  @IsIn([
    'DONACION_SANGRE',
    'VACUNACION',
    'PREVENCION',
    'TAMIZAJE',
    'CHARLA',
    'OTRO',
  ])
  tipo: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsDateString()
  fecha_inicio: string;

  @IsOptional()
  @IsDateString()
  fecha_fin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  lugar?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  responsable?: string;

  @IsOptional()
  @IsIn([
    'PLANIFICADA',
    'ACTIVA',
    'FINALIZADA',
    'CANCELADA',
  ])
  estado?: string;
}