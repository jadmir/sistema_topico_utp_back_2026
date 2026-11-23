import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CrearTriajeDto {
  @IsInt()
  atencion_id: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(300)
  frecuencia_cardiaca?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  frecuencia_respiratoria?: number;

  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(50)
  temperatura?: number;

  @IsOptional()
  @IsString()
  presion_arterial?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  saturacion_oxigeno?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  peso?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  talla?: number;

  @IsOptional()
  @IsBoolean()
  alergia_farmacos?: boolean;

  @IsOptional()
  @IsBoolean()
  alergia_alimentos?: boolean;

  @IsOptional()
  @IsString()
  clasificacion?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}