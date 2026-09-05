import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VehicleType, VehicleStatus } from '@kalix/shared';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, IsUUID } from 'class-validator';

export class CreateVehicleDto {
    @ApiProperty({ description: 'ID de la propiedad a la que se asocia' })
    @IsUUID('4', { message: 'ID de propiedad inválido' })
    @IsNotEmpty()
    propertyId!: string;

    @ApiProperty({ description: 'ID del residente o propietario del vehículo' })
    @IsUUID('4', { message: 'ID de usuario inválido' })
    @IsNotEmpty()
    userId!: string;

    @ApiProperty({ example: 'Toyota', description: 'Marca del vehículo' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    brand!: string;

    @ApiProperty({ example: 'Corolla', description: 'Modelo del vehículo' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    model!: string;

    @ApiProperty({ example: 'Gris Oscuro', description: 'Color del vehículo' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(30)
    color!: string;

    @ApiProperty({ example: 'ABC-1234', description: 'Placa o matrícula del vehículo' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    licensePlate!: string;

    @ApiPropertyOptional({ enum: VehicleType, default: VehicleType.CAR })
    @IsOptional()
    @IsEnum(VehicleType)
    type?: VehicleType;

    @ApiPropertyOptional({ enum: VehicleStatus, default: VehicleStatus.ACTIVE })
    @IsOptional()
    @IsEnum(VehicleStatus)
    status?: VehicleStatus;
}

