import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateBulkFeeDto {
    @ApiPropertyOptional({ description: 'Filtrar por ID de sección (si es opcional, se emite a toda la comunidad)' })
    @IsOptional()
    @IsUUID('4')
    sectionId?: string;

    @ApiProperty({ example: 'Mantenimiento Muestra Octubre 2026', description: 'Concepto masivo' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    concept!: string;

    @ApiProperty({ example: 1200.0, description: 'Monto a cobrar a cada propiedad' })
    @IsNumber()
    @IsPositive()
    amount!: number;

    @ApiProperty({ example: '2026-10-10T23:59:59.000Z', description: 'Fecha límite de pago' })
    @IsString()
    @IsNotEmpty()
    dueDate!: string;
}
