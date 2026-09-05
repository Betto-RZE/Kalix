import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateExpenseDto {
    @ApiProperty({ description: 'Categoría del gasto (ej. Mantenimiento, Servicios, Jardinería)', example: 'Mantenimiento' })
    @IsString({ message: 'La categoría debe ser un texto' })
    @MaxLength(100, { message: 'La categoría no puede exceder 100 caracteres' })
    category: string;

    @ApiProperty({ description: 'Descripción detallada del gasto', example: 'Reparación de la bomba de agua del edificio A' })
    @IsString({ message: 'La descripción debe ser un texto' })
    description: string;

    @ApiProperty({ description: 'Monto del gasto', example: 3500.50 })
    @IsNumber({}, { message: 'El monto debe ser un número' })
    @IsPositive({ message: 'El monto debe ser un valor positivo' })
    amount: number;

    @ApiProperty({ description: 'Fecha en la que se incurrió el gasto (ISO string)', example: '2026-09-05' })
    @IsDateString({}, { message: 'La fecha debe ser una fecha ISO válida' })
    date: string;

    @ApiPropertyOptional({ description: 'Nombre del proveedor o contratista', example: 'Plomería y Servicios S.A. de C.V.' })
    @IsOptional()
    @IsString({ message: 'El proveedor debe ser un texto' })
    @MaxLength(150, { message: 'El proveedor no puede exceder 150 caracteres' })
    supplier?: string;

    @ApiPropertyOptional({ description: 'URL de la factura o nota de venta', example: 'https://storage.kalix.app/receipts/exp-123.pdf' })
    @IsOptional()
    @IsString({ message: 'La URL del comprobante debe ser un texto' })
    receiptUrl?: string;
}
