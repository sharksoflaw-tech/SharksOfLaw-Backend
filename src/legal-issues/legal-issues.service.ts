import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { LegalIssue } from "./legal-issue.entity";
import { CreateLegalIssueDto } from "./dto/create-legal-issue.dto";
import { UpdateLegalIssueDto } from "./dto/update-legal-issue.dto";

@Injectable()
export class LegalIssuesService {
  constructor(
    @InjectRepository(LegalIssue)
    private readonly repo: Repository<LegalIssue>,
  ) {}

  findAllActive() {
    return this.repo.find({
      where: { isActive: true },
      order: { name: "ASC" },
    });
  }

  findAll() {
    return this.repo.find({
      order: { createdAt: "DESC" },
    });
  }

  create(dto: CreateLegalIssueDto) {
    const issue = this.repo.create(dto);
    return this.repo.save(issue);
  }

  async update(id: number, dto: UpdateLegalIssueDto) {
    const issue = await this.repo.findOne({ where: { id } });
    if (!issue) throw new NotFoundException("Legal issue not found");

    Object.assign(issue, dto);
    return this.repo.save(issue);
  }

  async remove(id: number) {
    const res = await this.repo.delete(id);
    if (!res.affected) throw new NotFoundException("Legal issue not found");
  }
}
