import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsNumber,
  Min,
} from 'class-validator';

export class CrearMovimientoDto {
  @IsInt()
  lote_id: number;

  @IsOptional()
  @IsInt()
  ubicacion_origen_id?: number;

  @IsOptional()
  @IsInt()
  ubicacion_destino_id?: number;

  @IsOptional()
  @IsInt()
  atencion_id?: number;

  @IsOptional()
  @IsInt()
  usuario_id?: number;

  @IsIn([
    'ENTRADA',
    'SALIDA',
    'TRASLADO',
    'AJUSTE_POSITIVO',
    'AJUSTE_NEGATIVO',
    'VENCIMIENTO',
    'MERMA',
  ])
  tipo_movimiento: string;

  @IsNumber()
  @Min(0.01)
  cantidad: number;

  @IsString()
  motivo: string;

  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}