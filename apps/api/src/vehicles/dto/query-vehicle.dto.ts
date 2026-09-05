import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryVehicleDto {
    @ApiPropertyOptional({ description: 'Filtrar por ID de propiedad' })
    propertyId?: string;

    @ApiPropertyOptional({ description: 'Filtrar por ID de usuario' })
    userId?: string;

    @ApiPropertyOptional({ description: 'Búsqueda por placa, marca o modelo' })
    search?: string;
}
