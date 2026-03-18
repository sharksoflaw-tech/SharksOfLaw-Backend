import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LegalIssue } from "./legal-issue.entity";
import { LegalIssuesController } from "./legal-issues.controller";
import { LegalIssuesService } from "./legal-issues.service";

@Module({
  imports: [TypeOrmModule.forFeature([LegalIssue])],
  controllers: [LegalIssuesController],
  providers: [LegalIssuesService],
  exports: [LegalIssuesService],
})
export class LegalIssuesModule {}
