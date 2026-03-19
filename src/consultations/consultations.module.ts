import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Consultation } from "./consultation.entity";
import { LegalIssue } from "../legal-issues/legal-issue.entity";
import { Lawyer } from "../lawyers/lawyer-profile.entity";
import { ConsultationsService } from "./consultations.service";
import { ConsultationsController } from "./consultations.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Consultation, LegalIssue, Lawyer])],
  controllers: [ConsultationsController],
  providers: [ConsultationsService],
  exports: [ConsultationsService],
})
export class ConsultationsModule {}
