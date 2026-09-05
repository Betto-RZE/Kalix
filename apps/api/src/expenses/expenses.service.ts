import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { QueryExpenseDto } from './dto/query-expense.dto';

@Injectable()
export class ExpensesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(communityId: string, dto: CreateExpenseDto, createdByUserId: string) {
        return this.prisma.expense.create({
            data: {
                communityId,
                category: dto.category,
                description: dto.description,
                amount: dto.amount,
                date: new Date(dto.date),
                supplier: dto.supplier,
                receiptUrl: dto.receiptUrl,
                createdBy: createdByUserId,
            },
        });
    }

    async findAllByCommunity(communityId: string, query: QueryExpenseDto) {
        const { category, startDate, endDate, search } = query;

        const whereClause: any = { communityId };

        if (category) {
            whereClause.category = { equals: category, mode: 'insensitive' };
        }

        if (startDate || endDate) {
            whereClause.date = {};
            if (startDate) whereClause.date.gte = new Date(startDate);
            if (endDate) whereClause.date.lte = new Date(endDate);
        }

        if (search) {
            whereClause.OR = [
                { description: { contains: search, mode: 'insensitive' } },
                { supplier: { contains: search, mode: 'insensitive' } },
                { category: { contains: search, mode: 'insensitive' } },
            ];
        }

        return this.prisma.expense.findMany({
            where: whereClause,
            orderBy: { date: 'desc' },
        });
    }

    async findOne(communityId: string, id: string) {
        const expense = await this.prisma.expense.findFirst({
            where: { id, communityId },
        });

        if (!expense) {
            throw new NotFoundException('Gasto no encontrado');
        }

        return expense;
    }

    async update(communityId: string, id: string, dto: UpdateExpenseDto) {
        await this.findOne(communityId, id);

        return this.prisma.expense.update({
            where: { id },
            data: {
                ...dto,
                ...(dto.date && { date: new Date(dto.date) }),
            },
        });
    }

    async remove(communityId: string, id: string) {
        await this.findOne(communityId, id);

        return this.prisma.expense.delete({
            where: { id },
        });
    }
}
