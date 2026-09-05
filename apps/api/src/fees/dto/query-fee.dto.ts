import { ApiPropertyOptional } from '@nestjs/swagger';
import { FeeStatus } from '@kalix/shared';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class QueryFeeDto {
    @ApiPropertyOptional({ description: 'Filtrar por ID de propiedad' })
    @IsOptional()
    @IsUUID('4')
    propertyId?: string;

    @ApiPropertyOptional({ description: 'Filtrar por ID de sección' })
    @IsOptional()
    @IsUUID('4')
    sectionId?: string;

    @ApiPropertyOptional({ enum: FeeStatus, description: 'Filtrar por estatus (PENDING, PAID, OVERDUE, CANCELLED)' })
    @IsOptional()
    @IsEnum(FeeStatus)
    status?: FeeStatus;

    @ApiPropertyOptional({ description: 'Búsqueda por concepto' })
    @IsOptional()
    @IsString()
    search?: string;
}
