import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FeeStatus } from '@kalix/shared';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateFeeDto {
    @ApiProperty({ description: 'ID de la propiedad a la que se le asigna la cuota' })
    @IsUUID('4', { message: 'ID de propiedad inválido' })
    @IsNotEmpty()
    propertyId!: string;

    @ApiProperty({ example: 'Mantenimiento Mensual Septiembre 2026', description: 'Concepto o título de la cuota' })
    @IsString()
    @IsNotEmpty({ message: 'El concepto de la cuota es obligatorio' })
    @MaxLength(200)
    concept!: string;

    @ApiProperty({ example: 1500.0, description: 'Monto de la cuota' })
    @IsNumber()
    @IsPositive({ message: 'El monto debe ser un número positivo' })
    amount!: number;

    @ApiProperty({ example: '2026-09-30T23:59:59.000Z', description: 'Fecha límite de pago' })
    @IsString()
    @IsNotEmpty()
    dueDate!: string;

    @ApiPropertyOptional({ enum: FeeStatus, default: FeeStatus.PENDING })
    @IsOptional()
    @IsEnum(FeeStatus)
    status?: FeeStatus;
}
