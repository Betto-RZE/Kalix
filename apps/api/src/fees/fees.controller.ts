import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FeesService } from './fees.service';
import { CreateFeeDto } from './dto/create-fee.dto';
import { CreateBulkFeeDto } from './dto/create-bulk-fee.dto';
import { UpdateFeeDto } from './dto/update-fee.dto';
import { QueryFeeDto } from './dto/query-fee.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommunityGuard } from '../common/guards/community.guard';

@ApiTags('Fees')
@ApiBearerAuth()
@ApiHeader({ name: 'x-community-id', description: 'ID de la comunidad activa', required: true })
@UseGuards(JwtAuthGuard, CommunityGuard)
@Controller('communities/:communityId/fees')
export class FeesController {
    constructor(private readonly feesService: FeesService) { }

    @Post()
    @ApiOperation({ summary: 'Crear una cuota individual para una propiedad' })
    @ApiResponse({ status: 201, description: 'Cuota creada' })
    async create(
        @Param('communityId') communityId: string,
        @Body() dto: CreateFeeDto,
    ) {
        return this.feesService.create(communityId, dto);
    }

    @Post('bulk')
    @ApiOperation({ summary: 'Emisión masiva de cuotas para propiedades de la comunidad o sección' })
    @ApiResponse({ status: 201, description: 'Cuotas generadas masivamente' })
    async createBulk(
        @Param('communityId') communityId: string,
        @Body() dto: CreateBulkFeeDto,
    ) {
        return this.feesService.createBulk(communityId, dto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todas las cuotas con filtros' })
    @ApiResponse({ status: 200, description: 'Lista de cuotas' })
    async findAll(
        @Param('communityId') communityId: string,
        @Query() query: QueryFeeDto,
    ) {
        return this.feesService.findAllByCommunity(communityId, query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener detalles de una cuota' })
    @ApiResponse({ status: 200, description: 'Detalle de la cuota' })
    async findOne(
        @Param('communityId') communityId: string,
        @Param('id') id: string,
    ) {
        return this.feesService.findOne(communityId, id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar una cuota' })
    @ApiResponse({ status: 200, description: 'Cuota actualizada' })
    async update(
        @Param('communityId') communityId: string,
        @Param('id') id: string,
        @Body() dto: UpdateFeeDto,
    ) {
        return this.feesService.update(communityId, id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar una cuota' })
    @ApiResponse({ status: 200, description: 'Cuota eliminada' })
    async remove(
        @Param('communityId') communityId: string,
        @Param('id') id: string,
    ) {
        return this.feesService.remove(communityId, id);
    }
}
