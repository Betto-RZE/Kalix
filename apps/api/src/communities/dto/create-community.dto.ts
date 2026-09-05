import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CommunityStatus } from '@kalix/shared';

export class CreateCommunityDto {
    @ApiProperty({ example: 'Residencial Los Olivos', description: 'Nombre de la comunidad' })
    @IsString()
    @IsNotEmpty({ message: 'El nombre de la comunidad es obligatorio' })
    name: string;

    @ApiProperty({ example: 'Comunidad privada de 50 casas con áreas verdes', required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: 'Av. Las Palmas #123, Col. Centro', required: false })
    @IsString()
    @IsOptional()
    address?: string;

    @ApiProperty({ example: '+525598765432', required: false })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiProperty({ example: 'contacto@losolivos.com', required: false })
    @IsEmail({}, { message: 'El correo electrónico no es válido' })
    @IsOptional()
    email?: string;

    @ApiProperty({ example: 'https://ejemplo.com/logo.png', required: false })
    @IsString()
    @IsOptional()
    logoUrl?: string;

    @ApiProperty({ enum: CommunityStatus, default: CommunityStatus.ACTIVE, required: false })
    @IsEnum(CommunityStatus)
    @IsOptional()
    status?: CommunityStatus;
}
