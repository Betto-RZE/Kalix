import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { QueryPaymentDto } from './dto/query-payment.dto';
import { PaymentStatus, FeeStatus } from '@kalix/shared';

@Injectable()
export class PaymentsService {
    constructor(private readonly prisma: PrismaService) { }

    private async syncFeeStatus(feeId: string) {
        const fee = await this.prisma.fee.findUnique({
            where: { id: feeId },
            include: { payments: true },
        });

        if (!fee) return;

        // Sumar todos los pagos completados
        const totalPaid = fee.payments
            .filter((p) => p.status === PaymentStatus.COMPLETED)
            .reduce((sum, p) => sum + Number(p.amount), 0);

        const feeAmount = Number(fee.amount);

        let newStatus = fee.status;
        if (totalPaid >= feeAmount) {
            newStatus = FeeStatus.PAID;
        } else if (fee.status === FeeStatus.PAID && totalPaid < feeAmount) {
            // Si estaba pagada pero se canceló un pago, vuelve a PENDING o OVERDUE
            const now = new Date();
            newStatus = new Date(fee.dueDate) < now ? FeeStatus.OVERDUE : FeeStatus.PENDING;
        }

        if (newStatus !== fee.status) {
            await this.prisma.fee.update({
                where: { id: feeId },
                data: { status: newStatus },
            });
        }
    }

    async create(communityId: string, dto: CreatePaymentDto, registeredByUserId?: string) {
        const fee = await this.prisma.fee.findFirst({
            where: {
                id: dto.feeId,
                property: { communityId },
            },
        });

        if (!fee) {
            throw new BadRequestException('La cuota especificada no existe o no pertenece a esta comunidad');
        }

        const payment = await this.prisma.payment.create({
            data: {
                feeId: dto.feeId,
                amount: dto.amount,
                paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : new Date(),
                method: dto.method,
                reference: dto.reference,
                status: dto.status ?? PaymentStatus.COMPLETED,
                receiptUrl: dto.receiptUrl,
                registeredBy: registeredByUserId,
            },
            include: {
                fee: {
                    include: {
                        property: {
                            select: {
                                id: true,
                                number: true,
                                section: { select: { name: true } },
                            },
                        },
                    },
                },
            },
        });

        // Sincronizar estado de la cuota si el pago fue completado
        await this.syncFeeStatus(dto.feeId);

        return payment;
    }

    async findAllByCommunity(communityId: string, query: QueryPaymentDto) {
        const { feeId, status, method, search } = query;

        const whereClause: any = {
            fee: {
                property: { communityId },
            },
        };

        if (feeId) {
            whereClause.feeId = feeId;
        }

        if (status) {
            whereClause.status = status;
        }

        if (method) {
            whereClause.method = method;
        }

        if (search) {
            whereClause.OR = [
                { reference: { contains: search, mode: 'insensitive' } },
                { fee: { concept: { contains: search, mode: 'insensitive' } } },
                { fee: { property: { number: { contains: search, mode: 'insensitive' } } } },
            ];
        }

        return this.prisma.payment.findMany({
            where: whereClause,
            include: {
                fee: {
                    include: {
                        property: {
                            select: {
                                id: true,
                                number: true,
                                section: { select: { id: true, name: true } },
                                members: {
                                    include: {
                                        user: { select: { firstName: true, lastName: true, email: true } },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(communityId: string, id: string) {
        const payment = await this.prisma.payment.findFirst({
            where: {
                id,
                fee: { property: { communityId } },
            },
            include: {
                fee: {
                    include: {
                        property: {
                            include: {
                                section: true,
                                members: {
                                    include: {
                                        user: { select: { firstName: true, lastName: true, email: true, phone: true } },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!payment) {
            throw new NotFoundException('Pago no encontrado');
        }

        return payment;
    }

    async updateStatus(communityId: string, id: string, dto: UpdatePaymentStatusDto) {
        const payment = await this.findOne(communityId, id);

        const updatedPayment = await this.prisma.payment.update({
            where: { id },
            data: { status: dto.status },
            include: {
                fee: {
                    select: { id: true, concept: true, amount: true },
                },
            },
        });

        // Sincronizar estado de la cuota correspondiente
        await this.syncFeeStatus(payment.feeId);

        return updatedPayment;
    }

    async remove(communityId: string, id: string) {
        const payment = await this.findOne(communityId, id);

        const deleted = await this.prisma.payment.delete({
            where: { id },
        });

        // Sincronizar estado de la cuota tras eliminar el pago
        await this.syncFeeStatus(payment.feeId);

        return deleted;
    }
}
