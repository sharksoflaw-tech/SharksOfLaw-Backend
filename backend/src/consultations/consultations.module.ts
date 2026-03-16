import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Consultation } from './consultation.entity';
import { LegalIssue } from '../legal-issues/legal-issue.entity';
import { Lawyer } from '../lawyers/lawyer.entity';
import { ConsultationsController } from './consultations.controller';
import { ConsultationsService } from './consultations.service';

@Module({
  imports: [TypeOrmModule.forFeature([Consultation, LegalIssue, Lawyer])],
  controllers: [ConsultationsController],
  providers: [ConsultationsService],
  exports: [ConsultationsService],
})
export class ConsultationsModule {}