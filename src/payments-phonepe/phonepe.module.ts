import { Module } from '@nestjs/common';
import { PhonePeService } from './phonepe.service';
import { PhonePeController } from './phonepe.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Consultation } from '../consultations/consultation.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Consultation])],
    controllers: [PhonePeController],
    providers: [PhonePeService],
})
export class PhonePeModule {}