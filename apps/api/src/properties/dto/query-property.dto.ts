import { ApiPropertyOptional } from '@nestjs/swagger';
import { PropertyStatus } from '@kalix/shared';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class QueryPropertyDto {
    @ApiPropertyOptional({ description: 'Filtrar por ID de sección' })
    @IsOptional()
    @IsUUID('4')
    sectionId?: string;

    @ApiPropertyOptional({ enum: PropertyStatus, description: 'Filtrar por estatus' })
    @IsOptional()
    @IsEnum(PropertyStatus)
    status?: PropertyStatus;

    @ApiPropertyOptional({ description: 'Búsqueda por número o dirección' })
    @IsOptional()
    @IsString()
    search?: string;
}

