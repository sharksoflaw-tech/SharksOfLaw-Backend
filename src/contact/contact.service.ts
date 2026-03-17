import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ContactRequest } from "./entity/contact.entity";
import { ContactDto } from "./dto/contact.dto";

@Injectable()
export class ContactService {
    constructor(
        @InjectRepository(ContactRequest)
        private readonly repo: Repository<ContactRequest>,
    ) {}

    async save(dto: ContactDto) {
        const entity = this.repo.create(dto);
        return this.repo.save(entity);
    }

    // Optional: list all contact requests (for admin dashboard)
    findAll() {
        return this.repo.find({
            order: { createdAt: "DESC" },
        });
    }

    // Optional: get a single request
    findOne(id: number) {
        return this.repo.findOne({ where: { id } });
    }
}