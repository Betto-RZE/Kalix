import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';

export class QueryExpenseDto {
    @ApiPropertyOptional({ description: 'Filtrar por categoría' })
    @IsOptional()
    @IsString()
    category?: string;

    @ApiPropertyOptional({ description: 'Fecha de inicio del rango (ISO string)' })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional({ description: 'Fecha de fin del rango (ISO string)' })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiPropertyOptional({ description: 'Búsqueda por descripción o proveedor' })
    @IsOptional()
    @IsString()
    search?: string;
}
