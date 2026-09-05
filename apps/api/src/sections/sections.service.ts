import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

@Injectable()
export class SectionsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(communityId: string, dto: CreateSectionDto) {
        const existing = await this.prisma.section.findUnique({
            where: {
                communityId_name: {
                    communityId,
                    name: dto.name,
                },
            },
        });

        if (existing) {
            throw new ConflictException(`Ya existe una sección con el nombre "${dto.name}" en esta comunidad`);
        }

        return this.prisma.section.create({
            data: {
                communityId,
                name: dto.name,
                description: dto.description,
            },
        });
    }

    async findAllByCommunity(communityId: string) {
        return this.prisma.section.findMany({
            where: { communityId },
            include: {
                _count: {
                    select: { properties: true },
                },
            },
            orderBy: { name: 'asc' },
        });
    }

    async findOne(communityId: string, id: string) {
        const section = await this.prisma.section.findFirst({
            where: { id, communityId },
            include: {
                properties: true,
            },
        });

        if (!section) {
            throw new NotFoundException('Sección no encontrada');
        }

        return section;
    }

    async update(communityId: string, id: string, dto: UpdateSectionDto) {
        await this.findOne(communityId, id);

        if (dto.name) {
            const existing = await this.prisma.section.findFirst({
                where: {
                    communityId,
                    name: dto.name,
                    NOT: { id },
                },
            });

            if (existing) {
                throw new ConflictException(`Ya existe otra sección con el nombre "${dto.name}"`);
            }
        }

        return this.prisma.section.update({
            where: { id },
            data: dto,
        });
    }

    async remove(communityId: string, id: string) {
        await this.findOne(communityId, id);

        return this.prisma.section.delete({
            where: { id },
        });
    }
}
