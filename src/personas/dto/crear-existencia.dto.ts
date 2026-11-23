import {
  IsInt,
  IsNumber,
  Min,
} from 'class-validator';

export class CrearExistenciaDto {
  @IsInt()
  lote_id: number;

  @IsInt()
  ubicacion_id: number;

  @IsNumber()
  @Min(0)
  cantidad: number;

  @IsNumber()
  @Min(0)
  stock_minimo: number;
}