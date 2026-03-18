import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from "@nestjs/common";
import { LawyersService } from "./lawyers.service";
import { CreateLawyerDto } from "./dto/create-lawyer.dto";
import { UpdateLawyerDto } from "./dto/update-lawyer.dto";

@Controller()
export class LawyersController {
  constructor(private readonly service: LawyersService) {}

  // Public listing with filters
  @Get("lawyers")
  findAll(@Query("practiceArea") practiceArea?: string) {
    return this.service.findAll(practiceArea);
  }

  // Public: single lawyer
  @Get("lawyers/:id")
  findOne(@Param("id") id: string) {
    return this.service.findOne(Number(id));
  }

  // Admin: create
  @Post("admin/lawyers")
  create(@Body() dto: CreateLawyerDto) {
    return this.service.create(dto);
  }

  // Admin: update
  @Patch("admin/lawyers/:id")
  update(@Param("id") id: string, @Body() dto: UpdateLawyerDto) {
    return this.service.update(Number(id), dto);
  }

  // Admin: delete
  @Delete("admin/lawyers/:id")
  remove(@Param("id") id: string) {
    return this.service.remove(Number(id));
  }
}
