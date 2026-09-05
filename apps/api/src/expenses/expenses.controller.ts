import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { QueryExpenseDto } from './dto/query-expense.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommunityGuard } from '../common/guards/community.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Expenses')
@ApiBearerAuth()
@ApiHeader({ name: 'x-community-id', description: 'ID de la comunidad activa', required: true })
@UseGuards(JwtAuthGuard, CommunityGuard)
@Controller('communities/:communityId/expenses')
export class ExpensesController {
    constructor(private readonly expensesService: ExpensesService) { }

    @Post()
    @ApiOperation({ summary: 'Registrar un nuevo gasto de la comunidad' })
    @ApiResponse({ status: 201, description: 'Gasto registrado exitosamente' })
    async create(
        @Param('communityId') communityId: string,
        @Body() dto: CreateExpenseDto,
        @CurrentUser('id') userId: string,
    ) {
        return this.expensesService.create(communityId, dto, userId);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todos los gastos de la comunidad con filtros' })
    @ApiResponse({ status: 200, description: 'Lista de gastos' })
    async findAll(
        @Param('communityId') communityId: string,
        @Query() query: QueryExpenseDto,
    ) {
        return this.expensesService.findAllByCommunity(communityId, query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener el detalle de un gasto' })
    @ApiResponse({ status: 200, description: 'Detalle del gasto' })
    async findOne(
        @Param('communityId') communityId: string,
        @Param('id') id: string,
    ) {
        return this.expensesService.findOne(communityId, id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar la información de un gasto' })
    @ApiResponse({ status: 200, description: 'Gasto actualizado' })
    async update(
        @Param('communityId') communityId: string,
        @Param('id') id: string,
        @Body() dto: UpdateExpenseDto,
    ) {
        return this.expensesService.update(communityId, id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar un gasto registrado' })
    @ApiResponse({ status: 200, description: 'Gasto eliminado' })
    async remove(
        @Param('communityId') communityId: string,
        @Param('id') id: string,
    ) {
        return this.expensesService.remove(communityId, id);
    }
}
