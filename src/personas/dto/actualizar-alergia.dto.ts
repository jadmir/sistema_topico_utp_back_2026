import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class ActualizarAlergiaDto {
  @IsOptional()
  @IsString()
  @IsIn(['MEDICAMENTO', 'ALIMENTO', 'OTRO'])
  tipo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  alergeno?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  activo?: boolean;
}