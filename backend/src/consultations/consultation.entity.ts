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

  @ManyToOne(() => LegalIssue, { eager: true, nullable: true })
  legalIssue: LegalIssue | null

  @ManyToOne(() => Lawyer, { eager: true, nullable: true })
  lawyer: Lawyer;

  // ---------------------
  // ✅ PHONEPE FIELDS
  // ---------------------

  @Column({ nullable: true })
  phonepeMerchantTransactionId?: string; // You generate this

  @Column({ nullable: true })
  phonepeTransactionId?: string; // PhonePe transaction ID

  @Column({ nullable: true })
  phonepeProviderReferenceId?: string; // PhonePe provider reference

  @Column({
    type: 'varchar',
    nullable: true,
  })
  paymentStatus?: 'PENDING' | 'SUCCESS' | 'FAILED';

  @CreateDateColumn()
  createdAt: Date;
}