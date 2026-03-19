import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Consultation } from './consultation.entity';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UsersService } from '../users/users.service';
import { LawyerProfileEntity } from '../lawyers/lawyer-profile.entity';

@Injectable()
export class ConsultationsService {
  constructor(
      @InjectRepository(Consultation)
      private readonly repo: Repository<Consultation>,

      @InjectRepository(LawyerProfileEntity)
      private readonly lawyerRepo: Repository<LawyerProfileEntity>,

      private readonly usersService: UsersService,
  ) {}

  async create(dto: CreateConsultationDto) {
    if (!dto.phone || !dto.firstName || !dto.lastName) {
      throw new BadRequestException('Missing required fields');
    }

    const code = dto.code ?? '+91';
    const mobileE164 = `${code}${dto.phone}`.replace(/\s+/g, '');

    // ✅ one identity table for future login
    const user = await this.usersService.findOrCreateByMobile(mobileE164, dto.email ?? null);

    // ✅ validate optional lawyerProfileId only when provided
    let lawyerProfileId: string | null = null;
    if (dto.lawyerProfileId) {
      const exists = await this.lawyerRepo.findOne({ where: { id: dto.lawyerProfileId, isActive: true } });
      if (!exists) throw new NotFoundException('Selected lawyer not found');
      lawyerProfileId = dto.lawyerProfileId;
    }

    const consult = this.repo.create({
      userId: user.id,
      lawyerProfileId,
      legalIssueId: dto.legalIssueId,
      language: dto.language,
      selectedPlan: dto.selectedPlan,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email ?? null,
      phone: dto.phone,
      code,
      state: dto.state ?? null,
      city: dto.city ?? null,
      caseDetails: dto.caseDetails ?? null,
      status: 'DRAFT',
    });

    return this.repo.save(consult);
  }

  async getById(id: number) {
    const consult = await this.repo.findOne({
      where: { id } as any,
      relations: { lawyerProfile: true, user: true } as any,
    });
    if (!consult) throw new NotFoundException('Consultation not found');
    return consult;
  }

// Called by payments callback (after payment success) to update consultation status to PAID
  async markAsPaid(consultationId: number, phonepeMerchantTransactionId: string) {
    const consult = await this.repo.findOneBy({ id: consultationId });
    if (!consult) throw new NotFoundException('Consultation not found');

    consult.status = 'CLOSED';
    (consult as any).phonepeMerchantTransactionId = phonepeMerchantTransactionId; // dynamic column for tracking
    return this.repo.save(consult);
  }
}