import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CrearDerivacionDto {
  @IsInt()
  atencion_id: number;

  @IsOptional()
  @IsInt()
  establecimiento_id?: number;

  @IsString()
  @MaxLength(500)
  motivo: string;

  @IsOptional()
  @IsIn([
    'AMBULANCIA',
    'VEHICULO_PARTICULAR',
    'TAXI',
    'A_PIE',
    'OTRO',
  ])
  tipo_traslado?: string;

  @IsOptional()
  @IsDateString()
  hora_llamada?: string;

  @IsOptional()
  @IsDateString()
  hora_llegada?: string;

  @IsOptional()
  @IsDateString()
  hora_traslado?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  acompanante?: string;

  @IsOptional()
  @IsIn([
    'PENDIENTE',
    'COORDINADO',
    'TRASLADADO',
    'ATENDIDO',
    'CANCELADO',
  ])
  estado?: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  diagnostico_probable?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}