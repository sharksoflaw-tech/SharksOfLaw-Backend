import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { LegalIssue } from '../legal-issues/legal-issue.entity';
import { Lawyer } from '../lawyers/lawyer.entity';

@Entity('consultations')
export class Consultation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  code: string; // country code

  @Column({ type: 'text', nullable: true })
  caseDetails: string;

  @Column({ default: 'NEW' })
  status: 'NEW' | 'IN_PROGRESS' | 'COMPLETED';

  @ManyToOne(() => LegalIssue, { eager: true })
  legalIssue: LegalIssue;

  @ManyToOne(() => Lawyer, { eager: true, nullable: true })
  lawyer: Lawyer;

  @Column({ nullable: true })
  razorpayOrderId?: string;

  @Column({ nullable: true })
  razorpayPaymentId?: string;

  @CreateDateColumn()
  createdAt: Date;
}
