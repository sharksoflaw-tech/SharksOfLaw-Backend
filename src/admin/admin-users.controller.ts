import {
    Controller,
    Get,
    Param,
    Patch,
    Query,
    Body,
    UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from '../users/user.entity';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { SetUserRoleDto } from './dto/set-user-role.dto';

@Controller('admin/users')
@UseGuards(RolesGuard)
@Roles('ADMIN')
export class AdminUsersController {
    constructor(
        @InjectRepository(UserEntity)
        private readonly usersRepo: Repository<UserEntity>,
    ) {}

    @Get()
    list(@Query('role') role?: 'CLIENT' | 'LAWYER' | 'ADMIN') {
        const where = role ? {role} : {};
        return this.usersRepo.find({where});
    }

    @Get(':id')
    get(@Param('id') id: string) {
        return this.usersRepo.findOne({ where: { id } });
    }

    @Patch(':id/role')
    async setRole(
        @Param('id') id: string,
        @Body() dto: SetUserRoleDto,
    ) {
        await this.usersRepo.update({ id }, { role: dto.role });
        return this.usersRepo.findOne({ where: { id } });
    }
}