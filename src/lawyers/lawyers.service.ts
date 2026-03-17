import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Lawyer } from "./lawyer.entity";
import { CreateLawyerDto } from "./dto/create-lawyer.dto";
import { UpdateLawyerDto } from "./dto/update-lawyer.dto";

@Injectable()
export class LawyersService {
    constructor(
        @InjectRepository(Lawyer)
        private readonly repo: Repository<Lawyer>,
    ) {}

    // Public listing with optional filter
    async findAll(practiceArea?: string) {
        if (practiceArea) {
            return this.repo.find({
                where: { practiceArea },
                order: { rating: "DESC" },
            });
        }
        return this.repo.find({
            order: { rating: "DESC" },
        });
    }

    async findOne(id: number) {
        const lawyer = await this.repo.findOne({ where: { id } });
        if (!lawyer) throw new NotFoundException("Lawyer not found");
        return lawyer;
    }

    create(dto: CreateLawyerDto) {
        const lawyer = this.repo.create(dto);
        return this.repo.save(lawyer);
    }

    async update(id: number, dto: UpdateLawyerDto) {
        const lawyer = await this.findOne(id);
        Object.assign(lawyer, dto);
        return this.repo.save(lawyer);
    }

    async remove(id: number) {
        const result = await this.repo.delete(id);
        if (!result.affected) throw new NotFoundException("Lawyer not found");
    }
}