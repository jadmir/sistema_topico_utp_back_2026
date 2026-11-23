import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CrearAlergiaDto {
  @IsInt()
  persona_id: number;

  @IsString()
  @IsIn(['MEDICAMENTO', 'ALIMENTO', 'OTRO'])
  tipo: string;

  @IsString()
  @MaxLength(150)
  alergeno: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}