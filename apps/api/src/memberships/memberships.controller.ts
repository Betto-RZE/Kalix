import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MembershipsService } from './memberships.service';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Memberships')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('memberships')
export class MembershipsController {
    constructor(private readonly membershipsService: MembershipsService) { }

    @Post()
    @ApiOperation({ summary: 'Asignar un usuario a una comunidad con un rol' })
    @ApiResponse({ status: 201, description: 'Membresía creada exitosamente' })
    @ApiResponse({ status: 409, description: 'El usuario ya pertenece a esta comunidad' })
    async create(@Body() dto: CreateMembershipDto) {
        return this.membershipsService.create(dto);
    }

    @Get('me')
    @ApiOperation({ summary: 'Obtener todas las comunidades a las que pertenece el usuario actual' })
    @ApiResponse({ status: 200, description: 'Lista de comunidades y roles del usuario' })
    async getMyMemberships(@CurrentUser('id') userId: string) {
        return this.membershipsService.getUserMemberships(userId);
    }

    @Get('community/:communityId')
    @ApiOperation({ summary: 'Obtener todos los usuarios miembros de una comunidad' })
    @ApiResponse({ status: 200, description: 'Lista de miembros de la comunidad' })
    async getCommunityMembers(@Param('communityId') communityId: string) {
        return this.membershipsService.getCommunityMembers(communityId);
    }
}
