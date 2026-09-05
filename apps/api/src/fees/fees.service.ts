import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeeDto } from './dto/create-fee.dto';
import { CreateBulkFeeDto } from './dto/create-bulk-fee.dto';
import { UpdateFeeDto } from './dto/update-fee.dto';
import { QueryFeeDto } from './dto/query-fee.dto';

@Injectable()
export class FeesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(communityId: string, dto: CreateFeeDto) {
        const property = await this.prisma.property.findFirst({
            where: { id: dto.propertyId, communityId },
        });

        if (!property) {
            throw new BadRequestException('La propiedad especificada no pertenece a esta comunidad');
        }

        return this.prisma.fee.create({
            data: {
                propertyId: dto.propertyId,
                concept: dto.concept,
                amount: dto.amount,
                dueDate: new Date(dto.dueDate),
                status: dto.status,
            },
            include: {
                property: {
                    select: { id: true, number: true, section: { select: { name: true } } },
                },
            },
        });
    }

    async createBulk(communityId: string, dto: CreateBulkFeeDto) {
        const whereClause: any = { communityId, status: 'ACTIVE' };
        if (dto.sectionId) {
            whereClause.sectionId = dto.sectionId;
        }

        const properties = await this.prisma.property.findMany({
            where: whereClause,
            select: { id: true },
        });

        if (properties.length === 0) {
            throw new BadRequestException('No se encontraron propiedades activas para generar las cuotas');
        }

        const feesData = properties.map((prop) => ({
            propertyId: prop.id,
            concept: dto.concept,
            amount: dto.amount,
            dueDate: new Date(dto.dueDate),
            status: 'PENDING' as const,
        }));

        const result = await this.prisma.fee.createMany({
            data: feesData,
        });

        return {
            message: `Se emitieron ${result.count} cuotas exitosamente`,
            count: result.count,
        };
    }

    async syncOverdueFees(communityId: string) {
        const now = new Date();
        await this.prisma.fee.updateMany({
            where: {
                property: { communityId },
                status: 'PENDING',
                dueDate: { lt: now },
            },
            data: {
                status: 'OVERDUE',
            },
        });
    }

    async findAllByCommunity(communityId: string, query: QueryFeeDto) {
        // Auto-sincronizar cuotas vencidas (OVERDUE)
        await this.syncOverdueFees(communityId);

        const { propertyId, sectionId, status, search } = query;

        const whereClause: any = {
            property: { communityId },
        };

        if (propertyId) {
            whereClause.propertyId = propertyId;
        }

        if (sectionId) {
            whereClause.property = { ...whereClause.property, sectionId };
        }

        if (status) {
            whereClause.status = status;
        }

        if (search) {
            whereClause.concept = { contains: search, mode: 'insensitive' };
        }

        const fees = await this.prisma.fee.findMany({
            where: whereClause,
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
                payments: true,
            },
            orderBy: { dueDate: 'asc' },
        });

        return fees.map((fee) => {
            const paidAmount = fee.payments
                .filter((p) => p.status === 'COMPLETED')
                .reduce((sum, p) => sum + Number(p.amount), 0);
            const amount = Number(fee.amount);
            const remainingAmount = Math.max(0, amount - paidAmount);

            return {
                ...fee,
                paidAmount,
                remainingAmount,
            };
        });
    }

    async findOne(communityId: string, id: string) {
        await this.syncOverdueFees(communityId);

        const fee = await this.prisma.fee.findFirst({
            where: {
                id,
                property: { communityId },
            },
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
                payments: true,
            },
        });

        if (!fee) {
            throw new NotFoundException('Cuota no encontrada');
        }

        const paidAmount = fee.payments
            .filter((p) => p.status === 'COMPLETED')
            .reduce((sum, p) => sum + Number(p.amount), 0);
        const amount = Number(fee.amount);
        const remainingAmount = Math.max(0, amount - paidAmount);

        return {
            ...fee,
            paidAmount,
            remainingAmount,
        };
    }

    async update(communityId: string, id: string, dto: UpdateFeeDto) {
        await this.findOne(communityId, id);

        return this.prisma.fee.update({
            where: { id },
            data: {
                ...dto,
                ...(dto.dueDate && { dueDate: new Date(dto.dueDate) }),
            },
            include: {
                property: { select: { number: true, section: { select: { name: true } } } },
            },
        });
    }

    async remove(communityId: string, id: string) {
        await this.findOne(communityId, id);

        return this.prisma.fee.delete({
            where: { id },
        });
    }
}
