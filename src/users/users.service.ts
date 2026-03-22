import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity, UserRole } from './user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly repo: Repository<UserEntity>,
    ) {}

    async findOrCreateByMobile(
        mobileE164: string,
        email?: string | null,
        rolesToAdd: UserRole[] = [UserRole.CLIENT],
    ) {
        let user = await this.repo.findOne({ where: { mobileE164 } });

        if (!user) {
            user = this.repo.create({
                mobileE164,
                email: email ?? null,
                roles: [...new Set(rolesToAdd)],
                mobileVerified: false,
            });

            return this.repo.save(user);
        }

        let changed = false;

        if (email && !user.email) {
            user.email = email;
            changed = true;
        }

        const currentRoles = Array.isArray(user.roles) ? user.roles : [];
        const mergedRoles = [...new Set([...currentRoles, ...rolesToAdd])] as UserRole[];

        if (mergedRoles.length !== currentRoles.length) {
            user.roles = mergedRoles;
            changed = true;
        }

        if (changed) {
            user = await this.repo.save(user);
        }

        return user;
    }

    async setRole(userId: string, role: UserRole) {
        const user = await this.repo.findOne({ where: { id: userId } });
        if (!user) return null;

        const currentRoles = Array.isArray(user.roles) ? user.roles : [];

        if (!currentRoles.includes(role)) {
            user.roles = [...currentRoles, role];
            await this.repo.save(user);
        }

        return user;
    }
}