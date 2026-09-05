import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { QueryPropertyDto } from './dto/query-property.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommunityGuard } from '../common/guards/community.guard';

@ApiTags('Properties')
@ApiBearerAuth()
@ApiHeader({ name: 'x-community-id', description: 'ID de la comunidad activa', required: true })
@UseGuards(JwtAuthGuard, CommunityGuard)
@Controller('communities/:communityId/properties')
export class PropertiesController {
    constructor(private readonly propertiesService: PropertiesService) { }

    @Post()
    @ApiOperation({ summary: 'Crear una nueva propiedad/inmueble' })
    @ApiResponse({ status: 201, description: 'Propiedad creada exitosamente' })
    async create(
        @Param('communityId') communityId: string,
        @Body() dto: CreatePropertyDto,
    ) {
        return this.propertiesService.create(communityId, dto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todas las propiedades con filtros' })
    @ApiResponse({ status: 200, description: 'Lista de propiedades' })
    async findAll(
        @Param('communityId') communityId: string,
        @Query() query: QueryPropertyDto,
    ) {
        return this.propertiesService.findAllByCommunity(communityId, query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener detalles de una propiedad' })
    @ApiResponse({ status: 200, description: 'Detalle de la propiedad' })
    async findOne(
        @Param('communityId') communityId: string,
        @Param('id') id: string,
    ) {
        return this.propertiesService.findOne(communityId, id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar una propiedad' })
    @ApiResponse({ status: 200, description: 'Propiedad actualizada' })
    async update(
        @Param('communityId') communityId: string,
        @Param('id') id: string,
        @Body() dto: UpdatePropertyDto,
    ) {
        return this.propertiesService.update(communityId, id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar una propiedad' })
    @ApiResponse({ status: 200, description: 'Propiedad eliminada' })
    async remove(
        @Param('communityId') communityId: string,
        @Param('id') id: string,
    ) {
        return this.propertiesService.remove(communityId, id);
    }
}
