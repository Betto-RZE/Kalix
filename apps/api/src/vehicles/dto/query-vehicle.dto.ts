import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class QueryVehicleDto {
    @ApiPropertyOptional({ description: 'Filtrar por ID de propiedad' })
    @IsOptional()
    @IsUUID('4')
    propertyId?: string;

    @ApiPropertyOptional({ description: 'Filtrar por ID de usuario' })
    @IsOptional()
    @IsUUID('4')
    userId?: string;

    @ApiPropertyOptional({ description: 'Búsqueda por placa, marca o modelo' })
    @IsOptional()
    @IsString()
    search?: string;
}

