import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CrearDonacionSangreDto {
  @IsInt()
  participacion_id: number;

  @IsString()
  @MaxLength(10)
  tipo_sangre: string;

  @IsOptional()
  @IsIn([
    'APTO',
    'NO_APTO',
    'PENDIENTE',
  ])
  resultado?: string;

  @IsOptional()
  @IsDateString()
  fecha_donacion?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}