import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommunitiesService } from './communities.service';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Communities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('communities')
export class CommunitiesController {
    constructor(private readonly communitiesService: CommunitiesService) { }

    @Post()
    @ApiOperation({ summary: 'Crear una nueva comunidad residencial' })
    @ApiResponse({ status: 201, description: 'Comunidad creada exitosamente' })
    async create(@Body() dto: CreateCommunityDto) {
        return this.communitiesService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todas las comunidades residenciales' })
    @ApiResponse({ status: 200, description: 'Lista de comunidades' })
    async findAll() {
        return this.communitiesService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener detalle de una comunidad por ID' })
    @ApiResponse({ status: 200, description: 'Detalle de la comunidad' })
    @ApiResponse({ status: 404, description: 'Comunidad no encontrada' })
    async findOne(@Param('id') id: string) {
        return this.communitiesService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar una comunidad residencial' })
    @ApiResponse({ status: 200, description: 'Comunidad actualizada' })
    async update(@Param('id') id: string, @Body() dto: UpdateCommunityDto) {
        return this.communitiesService.update(id, dto);
    }
}
