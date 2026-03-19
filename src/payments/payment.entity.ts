import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';

@Entity({ name: 'payments' })
export class PaymentEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'amount_inr', type: 'int' })
    amountInr: number;

    @Column({ type: 'varchar', length: 5, default: 'INR' })
    currency: string;

    @Column({ type: 'varchar', length: 20, default: 'PENDING' })
    status: PaymentStatus;

    @Index()
    @Column({ name: 'consultation_id', type: 'bigint', nullable: true })
    consultationId: number | null;

    @Index()
    @Column({ name: 'join_lawyer_application_id', type: 'uuid', nullable: true })
    joinLawyerApplicationId: string | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}