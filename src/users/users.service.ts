import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity, UserRole } from './user.entity';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(UserEntity) private repo: Repository<UserEntity>) {}

    async findOrCreateByMobile(
        mobileE164: string,
        email?: string | null,
        roleToAdd: 'CLIENT' | 'LAWYER' | 'ADMIN' = 'CLIENT',
    ) {
        const normalizedMobileE164 = String(mobileE164).replace(/\s+/g, '').trim();
        const normalizedEmail = email?.trim() || null;

        let user = await this.repo.findOne({
            where: { mobileE164: normalizedMobileE164 },
        });

        if (!user) {
            user = this.repo.create({
                mobileE164: normalizedMobileE164,
                email: normalizedEmail,
                roles: [roleToAdd],
                mobileVerified: false,
            });

            return this.repo.save(user);
        }

        const currentRoles = Array.isArray(user.roles) ? user.roles : [];

        let changed = false;

        if (!currentRoles.includes(roleToAdd)) {
            user.roles = [...currentRoles, roleToAdd];
            changed = true;
        }

        if (normalizedEmail && !user.email) {
            user.email = normalizedEmail;
            changed = true;
        }

        if (changed) {
            user = await this.repo.save(user);
        }

        return user;
    }

    async setRole(userId: string, role: UserRole) {
        await this.repo.update({ id: userId }, { role });
        return this.repo.findOne({ where: { id: userId } });
    }
}