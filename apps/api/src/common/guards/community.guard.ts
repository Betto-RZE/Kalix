import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CommunityGuard implements CanActivate {
    constructor(private readonly prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new UnauthorizedException('Usuario no autenticado');
        }

        // Extraer communityId desde cabecera, params o query
        const communityId =
            request.headers['x-community-id'] ||
            request.params?.communityId ||
            request.query?.communityId;

        if (!communityId) {
            throw new ForbiddenException(
                'Acceso denegado: Debe especificar la comunidad (Cabecera x-community-id)',
            );
        }

        // Validar que el usuario tenga una membresía activa en la comunidad
        const membership = await this.prisma.communityMembership.findUnique({
            where: {
                userId_communityId: {
                    userId: user.id,
                    communityId,
                },
            },
            include: {
                role: true,
            },
        });

        if (!membership || membership.status !== 'ACTIVE') {
            throw new ForbiddenException(
                'Acceso denegado: No cuentas con una membresía activa en esta comunidad',
            );
        }

        // Adjuntar la membresía y el rol al objeto Request para uso en los controladores
        request.communityMembership = membership;
        request.communityRole = membership.role.name;

        return true;
    }
}
