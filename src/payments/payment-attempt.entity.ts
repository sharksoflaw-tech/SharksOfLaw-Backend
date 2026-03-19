import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { PaymentEntity } from './payment.entity';

export type AttemptStatus = 'INITIATED' | 'PENDING' | 'SUCCESS' | 'FAILED';

@Entity({ name: 'payment_attempts' })
export class PaymentAttemptEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => PaymentEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'payment_id' })
    payment: PaymentEntity;

    @Column({ name: 'payment_id', type: 'uuid' })
    paymentId: string;

    @Column({ type: 'varchar', length: 20, default: 'PHONEPE' })
    provider: string;

    @Index({ unique: true })
    @Column({ name: 'merchant_transaction_id', type: 'varchar', length: 60 })
    merchantTransactionId: string;

    @Column({ name: 'provider_transaction_id', type: 'varchar', length: 80, nullable: true })
    providerTransactionId: string | null;

    @Column({ type: 'varchar', length: 20, default: 'INITIATED' })
    status: AttemptStatus;

    @Column({ name: 'raw_response', type: 'jsonb', nullable: true })
    rawResponse: any;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
    }