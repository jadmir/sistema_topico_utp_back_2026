import {
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class ActualizarExistenciaDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  cantidad?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock_minimo?: number;
}