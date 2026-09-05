import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsPositive, IsString, IsUUID, IsDateString } from 'class-validator';
import { PaymentMethod, PaymentStatus } from '@kalix/shared';

export class CreatePaymentDto {
    @ApiProperty({ description: 'ID de la cuota a la que pertenece el pago', example: 'uuid-fee-id' })
    @IsUUID('4', { message: 'El ID de la cuota debe ser un UUID válido' })
    feeId: string;

    @ApiProperty({ description: 'Monto pagado', example: 1500.00 })
    @IsNumber({}, { message: 'El monto debe ser un número' })
    @IsPositive({ message: 'El monto debe ser un valor positivo' })
    amount: number;

    @ApiPropertyOptional({ description: 'Fecha en la que se realizó el pago (ISO string)', example: '2026-09-05T10:00:00.000Z' })
    @IsOptional()
    @IsDateString({}, { message: 'La fecha de pago debe ser una fecha ISO válida' })
    paymentDate?: string;

    @ApiProperty({ enum: PaymentMethod, description: 'Método de pago utilizado', example: PaymentMethod.TRANSFER })
    @IsEnum(PaymentMethod, { message: 'Método de pago inválido' })
    method: PaymentMethod;

    @ApiPropertyOptional({ description: 'Número de referencia o folio de transacción', example: 'TR-987654321' })
    @IsOptional()
    @IsString({ message: 'La referencia debe ser un texto' })
    reference?: string;

    @ApiPropertyOptional({ enum: PaymentStatus, description: 'Estado inicial del pago', default: PaymentStatus.COMPLETED })
    @IsOptional()
    @IsEnum(PaymentStatus, { message: 'Estado de pago inválido' })
    status?: PaymentStatus;

    @ApiPropertyOptional({ description: 'URL del comprobante adjunto', example: 'https://storage.kalix.app/receipts/rec-123.pdf' })
    @IsOptional()
    @IsString({ message: 'La URL del comprobante debe ser un texto' })
    receiptUrl?: string;
}
