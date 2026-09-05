import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PropertyMemberType } from '@kalix/shared';

export class AssignPropertyMemberDto {
    @ApiProperty({ example: 'b9a8f270-1234-5678-90ab-cdef12345678', description: 'ID del usuario a asignar' })
    userId!: string;

    @ApiProperty({ enum: PropertyMemberType, example: PropertyMemberType.RESIDENT, description: 'Tipo de miembro: OWNER o RESIDENT' })
    type!: PropertyMemberType;

    @ApiPropertyOptional({ example: true, default: false, description: 'Indica si es el contacto o residente principal' })
    isPrimary?: boolean;

    @ApiPropertyOptional({ example: '2026-01-01T00:00:00.000Z', description: 'Fecha de inicio (opcional)' })
    startDate?: string;

    @ApiPropertyOptional({ example: '2026-12-31T00:00:00.000Z', description: 'Fecha fin (opcional)' })
    endDate?: string;
}
