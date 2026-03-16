import { PartialType } from "@nestjs/mapped-types";
import { CreateLegalIssueDto } from "./create-legal-issue.dto";

export class UpdateLegalIssueDto extends PartialType(CreateLegalIssueDto) {}