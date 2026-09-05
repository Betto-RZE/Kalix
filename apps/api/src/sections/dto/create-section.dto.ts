import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSectionDto {
    @ApiProperty({ example: 'Manzana A', description: 'Nombre de la sección o torre' })
    name!: string;

    @ApiPropertyOptional({ example: 'Sección residencial ubicada en la zona norte', description: 'Descripción opcional' })
    description?: string;
}
