import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LawyerProfileEntity } from './lawyer-profile.entity';
import { LawyersService } from './lawyers.service';
import { LawyersController } from './lawyers.controller';
import { JoinLawyerEntity } from '../join-lawyer/join-lawyer.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LawyerProfileEntity,
      JoinLawyerEntity,
    ]),
    UsersModule,
  ],
  controllers: [LawyersController],
  providers: [LawyersService],
  exports: [LawyersService],
})
export class LawyersModule {}