import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ContactRequest } from "./entity/contact.entity";
import { ContactService } from "./contact.service";
import { ContactController } from "./contact.controller";

@Module({
    imports: [TypeOrmModule.forFeature([ContactRequest])],
    controllers: [ContactController],
    providers: [ContactService],
    exports: [ContactService],
})
export class ContactModule {}