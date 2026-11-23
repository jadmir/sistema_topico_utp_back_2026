import {
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class ActualizarMarcaDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;

  @IsOptional()
  activo?: boolean;
}