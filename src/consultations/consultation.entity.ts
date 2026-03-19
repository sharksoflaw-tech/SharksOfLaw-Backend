// src/consultations/consultation.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { LawyerProfileEntity } from '../lawyers/lawyer-profile.entity';
import { UserEntity } from '../users/user.entity';

export type ConsultationStatus = 'DRAFT' | 'SUBMITTED' | 'CLOSED';

@Entity({ name: 'consultations' })
export class Consultation {
  @PrimaryGeneratedColumn()
  id: number;

  // ✅ who created it (client identity)
  @Index()
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity | null;

  // Optional assigned lawyer (when coming from lawyer card)
  @Index()
  @Column({ name: 'lawyer_profile_id', type: 'uuid', nullable: true })
  lawyerProfileId: string | null;

  @ManyToOne(() => LawyerProfileEntity, { nullable: true })
  @JoinColumn({ name: 'lawyer_profile_id' })
  lawyerProfile?: LawyerProfileEntity | null;

  // Step 1 selections
  @Column({ name: 'legal_issue_id', type: 'int' })
  legalIssueId: number;

  @Column({ type: 'varchar', length: 60 })
  language: string;

  @Column({ name: 'selected_plan', type: 'varchar', length: 20 })
  selectedPlan: string; // quick | standard | detailed

  // Step 2 info
  @Column({ name: 'first_name', type: 'varchar', length: 80 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 80 })
  lastName: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'varchar', length: 6, default: '+91' })
  code: string;

  @Column({ type: 'varchar', length: 80, nullable: true })
  state: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  city: string | null;

  @Column({ name: 'case_details', type: 'text', nullable: true })
  caseDetails: string | null;

  @Column({ type: 'varchar', length: 20, default: 'DRAFT' })
  status: ConsultationStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}