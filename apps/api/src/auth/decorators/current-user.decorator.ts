import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorador de parámetro para obtener el usuario autenticado del objeto Request
 */
export const CurrentUser = createParamDecorator(
    (data: string | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user;

        return data ? user?.[data] : user;
    },
);
