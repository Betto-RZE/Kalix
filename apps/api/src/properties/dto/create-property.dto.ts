import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PropertyStatus } from '@kalix/shared';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, IsUUID } from 'class-validator';

export class CreatePropertyDto {
    @ApiProperty({ example: 'b9a8f270-1234-5678-90ab-cdef12345678', description: 'ID de la sección a la que pertenece' })
    @IsUUID('4', { message: 'ID de sección inválido' })
    @IsNotEmpty({ message: 'La sección es obligatoria' })
    sectionId!: string;

    @ApiProperty({ example: 'Casa 102', description: 'Número o identificador del inmueble' })
    @IsString()
    @IsNotEmpty({ message: 'El número o identificador del inmueble es obligatorio' })
    @MaxLength(50, { message: 'El número no puede exceder 50 caracteres' })
    number!: string;

    @ApiPropertyOptional({ example: 'Calle Cipreses #102', description: 'Dirección física opcional' })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiPropertyOptional({ enum: PropertyStatus, default: PropertyStatus.ACTIVE, description: 'Estatus del inmueble' })
    @IsOptional()
    @IsEnum(PropertyStatus)
    status?: PropertyStatus;
}

