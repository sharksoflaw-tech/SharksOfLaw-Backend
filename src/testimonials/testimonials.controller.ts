import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from "@nestjs/common";
import { TestimonialsService } from "./testimonials.service";
import { CreateTestimonialDto } from "./dto/create-testimonial.dto";
import { UpdateTestimonialDto } from "./dto/update-testimonial.dto";

@Controller()
export class TestimonialsController {
  constructor(private readonly service: TestimonialsService) {}

  // PUBLIC (frontend)
  @Get("testimonials")
  findAll() {
    return this.service.findAll();
  }

  // ADMIN
  @Post("admin/testimonials")
  create(@Body() dto: CreateTestimonialDto) {
    return this.service.create(dto);
  }

  @Patch("admin/testimonials/:id")
  update(@Param("id") id: string, @Body() dto: UpdateTestimonialDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete("admin/testimonials/:id")
  remove(@Param("id") id: string) {
    return this.service.remove(Number(id));
  }
}
