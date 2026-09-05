import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SectionsService } from './sections.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommunityGuard } from '../common/guards/community.guard';

@ApiTags('Sections')
@ApiBearerAuth()
@ApiHeader({ name: 'x-community-id', description: 'ID de la comunidad activa', required: true })
@UseGuards(JwtAuthGuard, CommunityGuard)
@Controller('communities/:communityId/sections')
export class SectionsController {
    constructor(private readonly sectionsService: SectionsService) { }

    @Post()
    @ApiOperation({ summary: 'Crear una nueva sección/manzana en la comunidad' })
    @ApiResponse({ status: 201, description: 'Sección creada exitosamente' })
    async create(
        @Param('communityId') communityId: string,
        @Body() dto: CreateSectionDto,
    ) {
        return this.sectionsService.create(communityId, dto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todas las secciones de la comunidad' })
    @ApiResponse({ status: 200, description: 'Lista de secciones' })
    async findAll(@Param('communityId') communityId: string) {
        return this.sectionsService.findAllByCommunity(communityId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener detalles de una sección' })
    @ApiResponse({ status: 200, description: 'Detalle de la sección' })
    async findOne(
        @Param('communityId') communityId: string,
        @Param('id') id: string,
    ) {
        return this.sectionsService.findOne(communityId, id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar una sección' })
    @ApiResponse({ status: 200, description: 'Sección actualizada' })
    async update(
        @Param('communityId') communityId: string,
        @Param('id') id: string,
        @Body() dto: UpdateSectionDto,
    ) {
        return this.sectionsService.update(communityId, id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar una sección' })
    @ApiResponse({ status: 200, description: 'Sección eliminada' })
    async remove(
        @Param('communityId') communityId: string,
        @Param('id') id: string,
    ) {
        return this.sectionsService.remove(communityId, id);
    }
}
