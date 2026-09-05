import { ApiPropertyOptional } from '@nestjs/swagger';
import { PropertyStatus } from '@kalix/shared';

export class QueryPropertyDto {
    @ApiPropertyOptional({ description: 'Filtrar por ID de sección' })
    sectionId?: string;

    @ApiPropertyOptional({ enum: PropertyStatus, description: 'Filtrar por estatus' })
    status?: PropertyStatus;

    @ApiPropertyOptional({ description: 'Búsqueda por número o dirección' })
    search?: string;
}
