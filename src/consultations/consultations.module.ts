import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Consultation } from './consultation.entity';
import { ConsultationsService } from './consultations.service';
import { ConsultationsController } from './consultations.controller';
import { UsersModule } from '../users/users.module';
import { LawyerProfileEntity } from '../lawyers/lawyer-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Consultation, LawyerProfileEntity]),
    UsersModule,
  ],
  controllers: [ConsultationsController],
  providers: [ConsultationsService],
  exports: [ConsultationsService],
})
export class ConsultationsModule {}