import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class ActualizarProductoDto {
  @IsOptional()
  @IsInt()
  categoria_id?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  codigo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  presentacion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  unidad_medida?: string;

  @IsOptional()
  @IsIn(['MEDICAMENTO', 'INSUMO', 'MATERIAL_MEDICO', 'OTRO'])
  tipo?: string;

  @IsOptional()
  @IsIn(['BAJA', 'MEDIA', 'ALTA'])
  necesidad?: string;

  @IsOptional()
  activo?: boolean;
}