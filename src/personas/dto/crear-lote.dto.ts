import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CrearLoteDto {
  @IsInt()
  producto_id: number;

  @IsOptional()
  @IsInt()
  marca_id?: number;

  @IsString()
  @MaxLength(100)
  numero_lote: string;

  @IsDateString()
  fecha_ingreso: string;

  @IsDateString()
  fecha_vencimiento: string;

  @IsOptional()
  @IsInt()
  anio_compra?: number;

  @IsNumber()
  @Min(0)
  cantidad_inicial: number;

  @IsOptional()
  @IsString()
  observaciones?: string;
}