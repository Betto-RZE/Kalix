import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ArgonService } from './argon.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly argon: ArgonService,
        private readonly jwt: JwtService,
        private readonly config: ConfigService,
    ) { }

    /**
     * Registro de un nuevo usuario en la plataforma
     */
    async register(dto: RegisterDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });

        if (existingUser) {
            throw new ConflictException('El correo electrónico ya se encuentra registrado');
        }

        const passwordHash = await this.argon.hash(dto.password);

        const user = await this.prisma.user.create({
            data: {
                firstName: dto.firstName,
                lastName: dto.lastName,
                email: dto.email.toLowerCase(),
                passwordHash,
                phone: dto.phone,
            },
        });

        const tokens = await this.generateTokens(user.id, user.email);

        return {
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
            },
            ...tokens,
        };
    }

    /**
     * Autenticación de un usuario registrado
     */
    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });

        if (!user) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const isPasswordValid = await this.argon.verify(user.passwordHash, dto.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        if (user.status !== 'ACTIVE') {
            throw new UnauthorizedException('La cuenta de usuario se encuentra inactiva o suspendida');
        }

        const tokens = await this.generateTokens(user.id, user.email);

        return {
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                avatarUrl: user.avatarUrl,
            },
            ...tokens,
        };
    }

    /**
     * Generación de Tokens de Acceso y Refresh
     */
    private async generateTokens(userId: string, email: string) {
        const payload = { sub: userId, email };

        const accessToken = await this.jwt.signAsync(payload, {
            secret: this.config.get<string>('JWT_SECRET') || 'kalix_jwt_secret_dev',
            expiresIn: '1d',
        });

        const refreshToken = await this.jwt.signAsync(payload, {
            secret: this.config.get<string>('JWT_REFRESH_SECRET') || 'kalix_jwt_refresh_dev',
            expiresIn: '7d',
        });

        return {
            accessToken,
            refreshToken,
        };
    }
}
