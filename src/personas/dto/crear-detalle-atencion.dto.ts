import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CrearDetalleAtencionDto {
  @IsInt()
  atencion_id: number;

  @IsInt()
  lote_id: number;

  @IsNumber()
  @Min(0.01)
  cantidad: number;

  @IsOptional()
  @IsString()
  observaciones?: string;
}