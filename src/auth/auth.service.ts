import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UserEntity, UserRole } from '../users/user.entity';
import { AdminLoginDto } from './dto/admin-login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async adminLogin(dto: AdminLoginDto) {
    const identifier = dto.identifier.trim();

    const user = await this.usersRepo
      .createQueryBuilder('user')
      .where('user.email = :identifier', { identifier })
      .orWhere('user.mobileE164 = :identifier', { identifier })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('Password not set for this user');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const roles: UserRole[] = Array.isArray(user.roles) ? user.roles : [];

    if (!roles.includes(UserRole.ADMIN)) {
      throw new UnauthorizedException('You are not authorized to access admin panel');
    }

    const payload = {
      sub: user.id,
      email: user.email ?? null,
      mobileE164: user.mobileE164 ?? null,
      roles,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email ?? null,
        mobileE164: user.mobileE164 ?? null,
        roles,
      },
    };
  }
}