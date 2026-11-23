import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class CrearParticipacionCampaniaDto {
  @IsInt()
  campania_id: number;

  @IsInt()
  persona_id: number;

  @IsOptional()
  @IsDateString()
  fecha_registro?: string;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}