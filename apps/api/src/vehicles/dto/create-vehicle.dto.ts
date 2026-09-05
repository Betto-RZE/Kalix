import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VehicleType, VehicleStatus } from '@kalix/shared';

export class CreateVehicleDto {
    @ApiProperty({ description: 'ID de la propiedad a la que se asocia' })
    propertyId!: string;

    @ApiProperty({ description: 'ID del residente o propietario del vehículo' })
    userId!: string;

    @ApiProperty({ example: 'Toyota', description: 'Marca del vehículo' })
    brand!: string;

    @ApiProperty({ example: 'Corolla', description: 'Modelo del vehículo' })
    model!: string;

    @ApiProperty({ example: 'Gris Oscuro', description: 'Color del vehículo' })
    color!: string;

    @ApiProperty({ example: 'ABC-1234', description: 'Placa o matrícula del vehículo' })
    licensePlate!: string;

    @ApiPropertyOptional({ enum: VehicleType, default: VehicleType.CAR })
    type?: VehicleType;

    @ApiPropertyOptional({ enum: VehicleStatus, default: VehicleStatus.ACTIVE })
    status?: VehicleStatus;
}
