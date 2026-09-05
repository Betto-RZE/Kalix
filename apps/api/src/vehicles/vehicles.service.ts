import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { QueryVehicleDto } from './dto/query-vehicle.dto';

@Injectable()
export class VehiclesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(communityId: string, dto: CreateVehicleDto) {
        // 1. Validar que la propiedad pertenezca a esta comunidad
        const property = await this.prisma.property.findFirst({
            where: { id: dto.propertyId, communityId },
        });

        if (!property) {
            throw new BadRequestException('La propiedad especificada no pertenece a esta comunidad');
        }

        // 2. Validar que el usuario tenga membresía en la comunidad
        const membership = await this.prisma.communityMembership.findUnique({
            where: {
                userId_communityId: {
                    userId: dto.userId,
                    communityId,
                },
            },
        });

        if (!membership) {
            throw new BadRequestException('El usuario no pertenece a esta comunidad');
        }

        return this.prisma.vehicle.create({
            data: {
                propertyId: dto.propertyId,
                userId: dto.userId,
                brand: dto.brand,
                model: dto.model,
                color: dto.color,
                licensePlate: dto.licensePlate.toUpperCase(),
                type: dto.type,
                status: dto.status,
            },
            include: {
                property: {
                    select: { id: true, number: true, section: { select: { name: true } } },
                },
                user: {
                    select: { id: true, firstName: true, lastName: true, email: true },
                },
            },
        });
    }

    async findAllByCommunity(communityId: string, query: QueryVehicleDto) {
        const { propertyId, userId, search } = query;

        const whereClause: any = {
            property: { communityId },
        };

        if (propertyId) {
            whereClause.propertyId = propertyId;
        }

        if (userId) {
            whereClause.userId = userId;
        }

        if (search) {
            whereClause.OR = [
                { licensePlate: { contains: search, mode: 'insensitive' } },
                { brand: { contains: search, mode: 'insensitive' } },
                { model: { contains: search, mode: 'insensitive' } },
            ];
        }

        return this.prisma.vehicle.findMany({
            where: whereClause,
            include: {
                property: {
                    select: { id: true, number: true, section: { select: { id: true, name: true } } },
                },
                user: {
                    select: { id: true, firstName: true, lastName: true, email: true, phone: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(communityId: string, id: string) {
        const vehicle = await this.prisma.vehicle.findFirst({
            where: {
                id,
                property: { communityId },
            },
            include: {
                property: {
                    include: { section: true },
                },
                user: {
                    select: { id: true, firstName: true, lastName: true, email: true, phone: true },
                },
            },
        });

        if (!vehicle) {
            throw new NotFoundException('Vehículo no encontrado');
        }

        return vehicle;
    }

    async update(communityId: string, id: string, dto: UpdateVehicleDto) {
        await this.findOne(communityId, id);

        if (dto.propertyId) {
            const property = await this.prisma.property.findFirst({
                where: { id: dto.propertyId, communityId },
            });
            if (!property) {
                throw new BadRequestException('La propiedad no pertenece a esta comunidad');
            }
        }

        return this.prisma.vehicle.update({
            where: { id },
            data: {
                ...dto,
                ...(dto.licensePlate && { licensePlate: dto.licensePlate.toUpperCase() }),
            },
            include: {
                property: { select: { id: true, number: true, section: { select: { name: true } } } },
                user: { select: { id: true, firstName: true, lastName: true } },
            },
        });
    }

    async remove(communityId: string, id: string) {
        await this.findOne(communityId, id);

        return this.prisma.vehicle.delete({
            where: { id },
        });
    }
}
