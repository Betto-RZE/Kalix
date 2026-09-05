import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PropertyMemberType } from '@kalix/shared';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class AssignPropertyMemberDto {
    @ApiProperty({ example: 'b9a8f270-1234-5678-90ab-cdef12345678', description: 'ID del usuario a asignar' })
    @IsUUID('4', { message: 'ID de usuario inválido' })
    @IsNotEmpty({ message: 'El ID de usuario es obligatorio' })
    userId!: string;

    @ApiProperty({ enum: PropertyMemberType, example: PropertyMemberType.RESIDENT, description: 'Tipo de miembro: OWNER o RESIDENT' })
    @IsEnum(PropertyMemberType)
    @IsNotEmpty()
    type!: PropertyMemberType;

    @ApiPropertyOptional({ example: true, default: false, description: 'Indica si es el contacto o residente principal' })
    @IsOptional()
    @IsBoolean()
    isPrimary?: boolean;

    @ApiPropertyOptional({ example: '2026-01-01T00:00:00.000Z', description: 'Fecha de inicio (opcional)' })
    @IsOptional()
    @IsString()
    startDate?: string;

    @ApiPropertyOptional({ example: '2026-12-31T00:00:00.000Z', description: 'Fecha fin (opcional)' })
    @IsOptional()
    @IsString()
    endDate?: string;
}

