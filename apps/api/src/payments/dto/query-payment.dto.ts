import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaymentMethod, PaymentStatus } from '@kalix/shared';

export class QueryPaymentDto {
    @ApiPropertyOptional({ description: 'Filtrar por ID de cuota' })
    @IsOptional()
    @IsUUID('4', { message: 'El ID de la cuota debe ser un UUID válido' })
    feeId?: string;

    @ApiPropertyOptional({ enum: PaymentStatus, description: 'Filtrar por estado de pago' })
    @IsOptional()
    @IsEnum(PaymentStatus)
    status?: PaymentStatus;

    @ApiPropertyOptional({ enum: PaymentMethod, description: 'Filtrar por método de pago' })
    @IsOptional()
    @IsEnum(PaymentMethod)
    method?: PaymentMethod;

    @ApiPropertyOptional({ description: 'Búsqueda por referencia o concepto de cuota' })
    @IsOptional()
    @IsString()
    search?: string;
}
