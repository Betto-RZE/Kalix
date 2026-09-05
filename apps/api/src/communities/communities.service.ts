import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';

@Injectable()
export class CommunitiesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateCommunityDto) {
        return this.prisma.community.create({
            data: dto,
        });
    }

    async findAll() {
        return this.prisma.community.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: {
                        properties: true,
                        memberships: true,
                    },
                },
            },
        });
    }

    async findOne(id: string) {
        const community = await this.prisma.community.findUnique({
            where: { id },
            include: {
                sections: true,
                _count: {
                    select: {
                        properties: true,
                        memberships: true,
                        commonAreas: true,
                    },
                },
            },
        });

        if (!community) {
            throw new NotFoundException(`Comunidad con ID ${id} no encontrada`);
        }

        return community;
    }

    async update(id: string, dto: UpdateCommunityDto) {
        await this.findOne(id);
        return this.prisma.community.update({
            where: { id },
            data: dto,
        });
    }
}
