import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CrearEstablecimientoDto {
  @IsString()
  @MaxLength(150)
  nombre: string;

  @IsIn([
    'HOSPITAL',
    'CLINICA',
    'CENTRO_SALUD',
    'POLICLINICO',
    'OTRO',
  ])
  tipo: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  direccion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  telefono?: string;
}