import {Body, Controller, Get, Param, Patch, Post} from '@nestjs/common';
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

  @Patch(':id')
  async updateConsultation(
      @Param('id') id: number,
      @Body() body: any,
  ) {
    await this.svc.updateConsultation(id, body);

    return { message: 'Consultation updated successfully' };
  }
}