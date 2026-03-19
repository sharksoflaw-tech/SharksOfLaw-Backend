import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ConsultationsService } from './consultations.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';

@Controller('consultations') // ✅ NOT 'api/consultations'
export class ConsultationsController {
  constructor(private readonly svc: ConsultationsService) {}

  @Post()
  create(@Body() dto: CreateConsultationDto) {
    return this.svc.create(dto);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.svc.getById(Number(id));
  }
}