import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ContactService } from "./contact.service";
import { ContactDto } from "./dto/contact.dto";

@Controller()
export class ContactController {
    constructor(private readonly contactService: ContactService) {}

    // Public endpoint called by frontend "Reach out to us" form
    @Post("contact")
    async contact(@Body() dto: ContactDto) {
        return this.contactService.save(dto);
    }

    // Admin: list all contact requests (you can secure later with auth)
    @Get("admin/contact-requests")
    findAll() {
        return this.contactService.findAll();
    }

    // Admin: view a specific contact request
    @Get("admin/contact-requests/:id")
    findOne(@Param("id") id: string) {
        return this.contactService.findOne(Number(id));
    }
}