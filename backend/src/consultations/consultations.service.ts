import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Consultation } from './consultation.entity';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';
import { LegalIssue } from '../legal-issues/legal-issue.entity';
import { Lawyer } from '../lawyers/lawyer.entity';

@Injectable()
export class ConsultationsService {
  constructor(
      @InjectRepository(Consultation)
      private readonly repo: Repository<Consultation>,

      @InjectRepository(LegalIssue)
      private readonly legalRepo: Repository<LegalIssue>,

      @InjectRepository(Lawyer)
      private readonly lawyerRepo: Repository<Lawyer>,
  ) {}

  async create(dto: CreateConsultationDto) {

    let legalIssue: LegalIssue | null = null;

    if (dto.legalIssueId) {
      legalIssue = await this.legalRepo.findOne({ where: { id: dto.legalIssueId } });
      if (!legalIssue) {
        throw new NotFoundException('Invalid legal issue');
      }
    }


    let lawyer: Lawyer | null = null;

    if (dto.lawyerId) {
      lawyer = await this.lawyerRepo.findOne({
        where: { id: dto.lawyerId },
      });
    }

    const record = this.repo.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      code: dto.code,
      caseDetails: dto.caseDetails,

      // ⛔️ REMOVED Razorpay fields
      // razorpayOrderId: dto.razorpayOrderId,
      // razorpayPaymentId: dto.razorpayPaymentId,

      // If PhonePe adds any fields, add them here later:
      // phonepeTransactionId: dto.phonepeTransactionId,

      legalIssue,
      lawyer: lawyer || undefined,
    });

    return this.repo.save(record);
  }

  findAll() {
    return this.repo.find({
      order: { createdAt: 'DESC' },
    });
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async update(id: number, dto: UpdateConsultationDto) {
    const c = await this.repo.findOne({ where: { id } });

    if (!c) throw new NotFoundException('Consultation not found');

    Object.assign(c, dto);
    return this.repo.save(c);
  }

  async remove(id: number) {
    const res = await this.repo.delete(id);

    if (!res.affected) {
      throw new NotFoundException('Consultation not found');
    }
  }
}