import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CrearUsuarioDto {
  @IsInt()
  rol_id: number;

  @IsString()
  nombres: string;

  @IsOptional()
  @IsString()
  apellidos?: string;

  @IsEmail()
  correo: string;

  @IsString()
  @MinLength(6)
  password: string;
}