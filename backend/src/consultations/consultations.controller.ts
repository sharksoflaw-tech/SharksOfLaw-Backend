import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Patch,
  Delete,
} from '@nestjs/common';
import { ConsultationsService } from './consultations.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';

@Controller()
export class ConsultationsController {
  constructor(private readonly service: ConsultationsService) {}

  @Post('consultations')
  create(@Body() dto: CreateConsultationDto) {
    return this.service.create(dto);
  }

  @Get('admin/consultations')
  findAll() {
    return this.service.findAll();
  }

  @Get('admin/consultations/:id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(Number(id));
  }

  @Patch('admin/consultations/:id')
  update(@Param('id') id: string, @Body() dto: UpdateConsultationDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete('admin/consultations/:id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}
