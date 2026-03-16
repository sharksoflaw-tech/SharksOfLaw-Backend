import { Controller, Get, Post, Patch, Delete, Param, Body } from "@nestjs/common";
import { LegalIssuesService } from "./legal-issues.service";
import { CreateLegalIssueDto } from "./dto/create-legal-issue.dto";
import { UpdateLegalIssueDto } from "./dto/update-legal-issue.dto";

@Controller()
export class LegalIssuesController {
    constructor(private readonly legalIssuesService: LegalIssuesService) {}

    @Get("legal-issues")
    findAllActive() {
        return this.legalIssuesService.findAllActive();
    }

    @Get("admin/legal-issues")
    findAll() {
        return this.legalIssuesService.findAll();
    }

    @Post("admin/legal-issues")
    create(@Body() dto: CreateLegalIssueDto) {
        return this.legalIssuesService.create(dto);
    }

    @Patch("admin/legal-issues/:id")
    update(@Param("id") id: string, @Body() dto: UpdateLegalIssueDto) {
        return this.legalIssuesService.update(Number(id), dto);
    }

    @Delete("admin/legal-issues/:id")
    remove(@Param("id") id: string) {
        return this.legalIssuesService.remove(Number(id));
    }
}