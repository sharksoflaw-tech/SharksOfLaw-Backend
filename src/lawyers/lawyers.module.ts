import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LawyerProfileEntity } from './lawyer-profile.entity';
import { LawyersService } from './lawyers.service';
import { AdminLawyersController } from '../admin/admin-lawyers.controller';
import { JoinLawyerApplicationEntity } from '../join-lawyer/join-lawyer-application.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LawyerProfileEntity, JoinLawyerApplicationEntity]),
    UsersModule,
  ],
  providers: [LawyersService],
  controllers: [AdminLawyersController],
})
export class LawyersModule {}