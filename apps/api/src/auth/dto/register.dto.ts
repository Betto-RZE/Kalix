import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
    @ApiProperty({ example: 'Juan', description: 'Nombre del usuario' })
    @IsString()
    @IsNotEmpty({ message: 'El nombre es obligatorio' })
    firstName: string;

    @ApiProperty({ example: 'Pérez', description: 'Apellido del usuario' })
    @IsString()
    @IsNotEmpty({ message: 'El apellido es obligatorio' })
    lastName: string;

    @ApiProperty({ example: 'juan.perez@example.com', description: 'Correo electrónico' })
    @IsEmail({}, { message: 'El correo electrónico no es válido' })
    @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
    email: string;

    @ApiProperty({ example: 'Password123!', description: 'Contraseña (mínimo 6 caracteres)' })
    @IsString()
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    password: string;

    @ApiProperty({ example: '+525512345678', description: 'Teléfono de contacto', required: false })
    @IsString()
    @IsOptional()
    phone?: string;
}
