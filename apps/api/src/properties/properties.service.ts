import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { QueryPropertyDto } from './dto/query-property.dto';

@Injectable()
export class PropertiesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(communityId: string, dto: CreatePropertyDto) {
        // Validar que la sección exista y pertenezca a esta comunidad
        const section = await this.prisma.section.findFirst({
            where: { id: dto.sectionId, communityId },
        });

        if (!section) {
            throw new BadRequestException('La sección especificada no pertenece a esta comunidad');
        }

        // Validar duplicidad de número en la misma sección
        const existing = await this.prisma.property.findUnique({
            where: {
                sectionId_number: {
                    sectionId: dto.sectionId,
                    number: dto.number,
                },
            },
        });

        if (existing) {
            throw new ConflictException(`Ya existe una propiedad con el número "${dto.number}" en esta sección`);
        }

        return this.prisma.property.create({
            data: {
                communityId,
                sectionId: dto.sectionId,
                number: dto.number,
                address: dto.address,
                status: dto.status,
            },
            include: {
                section: {
                    select: { id: true, name: true },
                },
            },
        });
    }

    async findAllByCommunity(communityId: string, query: QueryPropertyDto) {
        const { sectionId, status, search } = query;

        const whereClause: any = { communityId };

        if (sectionId) {
            whereClause.sectionId = sectionId;
        }

        if (status) {
            whereClause.status = status;
        }

        if (search) {
            whereClause.OR = [
                { number: { contains: search, mode: 'insensitive' } },
                { address: { contains: search, mode: 'insensitive' } },
            ];
        }

        return this.prisma.property.findMany({
            where: whereClause,
            include: {
                section: {
                    select: { id: true, name: true },
                },
                members: {
                    include: {
                        user: {
                            select: { id: true, firstName: true, lastName: true, email: true, phone: true },
                        },
                    },
                },
                _count: {
                    select: {
                        vehicles: true,
                        members: true,
                    },
                },
            },
            orderBy: [{ section: { name: 'asc' } }, { number: 'asc' }],
        });
    }

    async findOne(communityId: string, id: string) {
        const property = await this.prisma.property.findFirst({
            where: { id, communityId },
            include: {
                section: true,
                members: {
                    include: {
                        user: {
                            select: { id: true, firstName: true, lastName: true, email: true, phone: true, avatarUrl: true },
                        },
                    },
                },
                vehicles: true,
            },
        });

        if (!property) {
            throw new NotFoundException('Propiedad no encontrada');
        }

        return property;
    }

    async update(communityId: string, id: string, dto: UpdatePropertyDto) {
        const property = await this.findOne(communityId, id);

        if (dto.sectionId) {
            const section = await this.prisma.section.findFirst({
                where: { id: dto.sectionId, communityId },
            });
            if (!section) {
                throw new BadRequestException('La nueva sección no pertenece a esta comunidad');
            }
        }

        const targetSectionId = dto.sectionId || property.sectionId;

        if (dto.number) {
            const existing = await this.prisma.property.findFirst({
                where: {
                    sectionId: targetSectionId,
                    number: dto.number,
                    NOT: { id },
                },
            });

            if (existing) {
                throw new ConflictException(`Ya existe otra propiedad con el número "${dto.number}" en esa sección`);
            }
        }

        return this.prisma.property.update({
            where: { id },
            data: dto,
            include: {
                section: { select: { id: true, name: true } },
            },
        });
    }

    async remove(communityId: string, id: string) {
        await this.findOne(communityId, id);

        return this.prisma.property.delete({
            where: { id },
        });
    }
}
