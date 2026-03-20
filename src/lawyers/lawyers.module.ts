import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LawyerProfileEntity } from './lawyer-profile.entity';
import { LawyersService } from './lawyers.service';
import { LawyersController } from './lawyers.controller';
import { JoinLawyerApplicationEntity } from '../join-lawyer/join-lawyer-application.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LawyerProfileEntity,
      JoinLawyerApplicationEntity,
    ]),
    UsersModule,
  ],
  controllers: [LawyersController],
  providers: [LawyersService],
  exports: [LawyersService],
})
export class LawyersModule {}