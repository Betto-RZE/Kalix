import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMembershipDto } from './dto/create-membership.dto';

@Injectable()
export class MembershipsService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Asigna un usuario a una comunidad con un rol específico
     */
    async create(dto: CreateMembershipDto) {
        const existing = await this.prisma.communityMembership.findUnique({
            where: {
                userId_communityId: {
                    userId: dto.userId,
                    communityId: dto.communityId,
                },
            },
        });

        if (existing) {
            throw new ConflictException('El usuario ya cuenta con una membresía en esta comunidad');
        }

        const role = await this.prisma.role.findUnique({
            where: { name: dto.roleName },
        });

        if (!role) {
            throw new NotFoundException(`El rol ${dto.roleName} no existe en el sistema`);
        }

        return this.prisma.communityMembership.create({
            data: {
                userId: dto.userId,
                communityId: dto.communityId,
                roleId: role.id,
            },
            include: {
                user: {
                    select: { id: true, firstName: true, lastName: true, email: true },
                },
                community: {
                    select: { id: true, name: true },
                },
                role: true,
            },
        });
    }

    /**
     * Obtiene todas las membresías y comunidades del usuario autenticado
     */
    async getUserMemberships(userId: string) {
        return this.prisma.communityMembership.findMany({
            where: { userId, status: 'ACTIVE' },
            include: {
                community: true,
                role: true,
            },
        });
    }

    /**
     * Obtiene todos los miembros de una comunidad específica
     */
    async getCommunityMembers(communityId: string) {
        return this.prisma.communityMembership.findMany({
            where: { communityId },
            include: {
                user: {
                    select: { id: true, firstName: true, lastName: true, email: true, phone: true, avatarUrl: true },
                },
                role: true,
            },
        });
    }
}
