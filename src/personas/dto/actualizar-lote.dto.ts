import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class ActualizarLoteDto {
  @IsOptional()
  @IsInt()
  producto_id?: number;

  @IsOptional()
  @IsInt()
  marca_id?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  numero_lote?: string;

  @IsOptional()
  @IsDateString()
  fecha_ingreso?: string;

  @IsOptional()
  @IsDateString()
  fecha_vencimiento?: string;

  @IsOptional()
  @IsInt()
  anio_compra?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cantidad_inicial?: number;

  @IsOptional()
  @IsString()
  observaciones?: string;
}