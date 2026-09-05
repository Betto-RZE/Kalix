import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';

/**
 * Decorador de parámetro para obtener el communityId desde las cabeceras (x-community-id),
 * parámetros de ruta (:communityId) o query (?communityId=...)
 */
export const ActiveCommunity = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): string => {
        const request = ctx.switchToHttp().getRequest();
        const communityId =
            request.headers['x-community-id'] ||
            request.params?.communityId ||
            request.query?.communityId;

        if (!communityId) {
            throw new BadRequestException(
                'El identificador de la comunidad es obligatorio (Cabecera x-community-id o parámetro communityId)',
            );
        }

        return communityId as string;
    },
);
