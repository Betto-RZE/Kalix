import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { RoleName } from '@kalix/shared';

export class CreateMembershipDto {
    @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', description: 'ID del usuario' })
    @IsUUID('4', { message: 'El ID del usuario debe ser un UUID válido' })
    @IsNotEmpty()
    userId: string;

    @ApiProperty({ example: 'a12bc30d-99ee-4882-b111-0f02b2c3d999', description: 'ID de la comunidad' })
    @IsUUID('4', { message: 'El ID de la comunidad debe ser un UUID válido' })
    @IsNotEmpty()
    communityId: string;

    @ApiProperty({ enum: RoleName, example: RoleName.RESIDENT, description: 'Rol asignado en la comunidad' })
    @IsEnum(RoleName)
    @IsNotEmpty()
    roleName: RoleName;
}
