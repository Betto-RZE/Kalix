import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { QueryVehicleDto } from './dto/query-vehicle.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommunityGuard } from '../common/guards/community.guard';

@ApiTags('Vehicles')
@ApiBearerAuth()
@ApiHeader({ name: 'x-community-id', description: 'ID de la comunidad activa', required: true })
@UseGuards(JwtAuthGuard, CommunityGuard)
@Controller('communities/:communityId/vehicles')
export class VehiclesController {
    constructor(private readonly vehiclesService: VehiclesService) { }

    @Post()
    @ApiOperation({ summary: 'Registrar un nuevo vehículo' })
    @ApiResponse({ status: 201, description: 'Vehículo registrado exitosamente' })
    async create(
        @Param('communityId') communityId: string,
        @Body() dto: CreateVehicleDto,
    ) {
        return this.vehiclesService.create(communityId, dto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener vehículos registrados con filtros' })
    @ApiResponse({ status: 200, description: 'Lista de vehículos' })
    async findAll(
        @Param('communityId') communityId: string,
        @Query() query: QueryVehicleDto,
    ) {
        return this.vehiclesService.findAllByCommunity(communityId, query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener detalles de un vehículo' })
    @ApiResponse({ status: 200, description: 'Detalle del vehículo' })
    async findOne(
        @Param('communityId') communityId: string,
        @Param('id') id: string,
    ) {
        return this.vehiclesService.findOne(communityId, id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar datos de un vehículo' })
    @ApiResponse({ status: 200, description: 'Vehículo actualizado' })
    async update(
        @Param('communityId') communityId: string,
        @Param('id') id: string,
        @Body() dto: UpdateVehicleDto,
    ) {
        return this.vehiclesService.update(communityId, id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar un vehículo' })
    @ApiResponse({ status: 200, description: 'Vehículo eliminado' })
    async remove(
        @Param('communityId') communityId: string,
        @Param('id') id: string,
    ) {
        return this.vehiclesService.remove(communityId, id);
    }
}
