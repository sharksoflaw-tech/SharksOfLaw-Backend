import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Consultation } from './consultations.entity';
import { ConsultationsService } from './consultations.service';
import { ConsultationsController } from './consultations.controller';
import { UsersModule } from '../users/users.module';
import { LawyersEntity } from '../lawyers/lawyers.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Consultation, LawyersEntity]),
    UsersModule,
  ],
  controllers: [ConsultationsController],
  providers: [ConsultationsService],
  exports: [ConsultationsService],
})
export class ConsultationsModule {}