import {
    Controller,
    Get,
    Param,
    Patch,
    Query,
    Body,
    UseGuards,
    NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Raw } from 'typeorm';

import { UserEntity, UserRole } from '../users/user.entity';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { SetUserRoleDto } from './dto/set-user-role.dto';
import { Delete } from '@nestjs/common';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminUsersController {
    constructor(
        @InjectRepository(UserEntity)
        private readonly usersRepo: Repository<UserEntity>,
    ) {}

    @Get()
    async list(@Query('role') role?: UserRole) {
        if (!role) {
            return this.usersRepo.find({
                order: { createdAt: 'DESC' },
            });
        }

        return this.usersRepo.find({
            where: {
                roles: Raw((alias) => `:role = ANY(${alias})`, { role }),
            },
            order: { createdAt: 'DESC' },
        });
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
        const user = await this.usersRepo.findOne({ where: { id } });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const currentRoles: UserRole[] = Array.isArray(user.roles) ? user.roles : [];

        if (!currentRoles.includes(dto.role)) {
            user.roles = [...currentRoles, dto.role];
            await this.usersRepo.save(user);
        }

        return this.usersRepo.findOne({ where: { id } });
    }

    @Delete(':id')
    async deleteUser(@Param('id') id: string) {
      const user = await this.usersRepo.findOne({ where: { id } });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      await this.usersRepo.remove(user);

      return { message: 'User deleted successfully' };
    }
}