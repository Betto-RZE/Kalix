import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSectionDto {
    @ApiProperty({ example: 'Manzana A', description: 'Nombre de la sección o torre' })
    @IsString()
    @IsNotEmpty({ message: 'El nombre de la sección es obligatorio' })
    @MaxLength(100, { message: 'El nombre no puede exceder los 100 caracteres' })
    name!: string;

    @ApiPropertyOptional({ example: 'Sección residencial ubicada en la zona norte', description: 'Descripción opcional' })
    @IsOptional()
    @IsString()
    description?: string;
}

