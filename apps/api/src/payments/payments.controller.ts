import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { QueryPaymentDto } from './dto/query-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommunityGuard } from '../common/guards/community.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Payments')
@ApiBearerAuth()
@ApiHeader({ name: 'x-community-id', description: 'ID de la comunidad activa', required: true })
@UseGuards(JwtAuthGuard, CommunityGuard)
@Controller('communities/:communityId/payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post()
    @ApiOperation({ summary: 'Registrar un pago de cuota' })
    @ApiResponse({ status: 201, description: 'Pago registrado exitosamente' })
    async create(
        @Param('communityId') communityId: string,
        @Body() dto: CreatePaymentDto,
        @CurrentUser('id') userId: string,
    ) {
        return this.paymentsService.create(communityId, dto, userId);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todos los pagos registrados con filtros' })
    @ApiResponse({ status: 200, description: 'Lista de pagos' })
    async findAll(
        @Param('communityId') communityId: string,
        @Query() query: QueryPaymentDto,
    ) {
        return this.paymentsService.findAllByCommunity(communityId, query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener detalle de un pago por ID' })
    @ApiResponse({ status: 200, description: 'Detalle del pago' })
    async findOne(
        @Param('communityId') communityId: string,
        @Param('id') id: string,
    ) {
        return this.paymentsService.findOne(communityId, id);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Actualizar el estado de un pago (Aprobar / Cancelar)' })
    @ApiResponse({ status: 200, description: 'Estado de pago actualizado' })
    async updateStatus(
        @Param('communityId') communityId: string,
        @Param('id') id: string,
        @Body() dto: UpdatePaymentStatusDto,
    ) {
        return this.paymentsService.updateStatus(communityId, id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar un pago registrado' })
    @ApiResponse({ status: 200, description: 'Pago eliminado' })
    async remove(
        @Param('communityId') communityId: string,
        @Param('id') id: string,
    ) {
        return this.paymentsService.remove(communityId, id);
    }
}
