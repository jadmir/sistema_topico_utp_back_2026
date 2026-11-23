import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CrearProductoDto {
  @IsInt()
  categoria_id: number;

  @IsString()
  @MaxLength(50)
  codigo: string;

  @IsString()
  @MaxLength(150)
  nombre: string;

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
}