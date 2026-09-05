import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PropertyStatus } from '@kalix/shared';

export class CreatePropertyDto {
    @ApiProperty({ example: 'b9a8f270-1234-5678-90ab-cdef12345678', description: 'ID de la sección a la que pertenece' })
    sectionId!: string;

    @ApiProperty({ example: 'Casa 102', description: 'Número o identificador del inmueble' })
    number!: string;

    @ApiPropertyOptional({ example: 'Calle Cipreses #102', description: 'Dirección física opcional' })
    address?: string;

    @ApiPropertyOptional({ enum: PropertyStatus, default: PropertyStatus.ACTIVE, description: 'Estatus del inmueble' })
    status?: PropertyStatus;
}
