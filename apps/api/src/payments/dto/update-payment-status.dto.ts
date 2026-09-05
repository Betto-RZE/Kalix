import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { PaymentStatus } from '@kalix/shared';

export class UpdatePaymentStatusDto {
    @ApiProperty({ enum: PaymentStatus, description: 'Nuevo estado del pago', example: PaymentStatus.COMPLETED })
    @IsEnum(PaymentStatus, { message: 'Estado de pago inválido' })
    status: PaymentStatus;
}
