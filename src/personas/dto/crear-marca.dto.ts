import {
  IsString,
  MaxLength,
} from 'class-validator';

export class CrearMarcaDto {
  @IsString()
  @MaxLength(100)
  nombre: string;
}