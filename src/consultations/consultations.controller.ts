import {Body, Controller, Get, Param, Patch, Post} from '@nestjs/common';
import { ConsultationsService } from './consultations.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import {UpdateConsultationDto} from "./dto/update-consultation.dto";

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

  @Patch(':id')
  updateConsultation(
      @Param('id') id: string,
      @Body() dto: UpdateConsultationDto,
  ) {
    return this.svc.updateConsultation(Number(id), dto);
  }
}