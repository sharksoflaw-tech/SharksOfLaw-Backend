import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { UserEntity } from '../users/user.entity';

@Entity({ name: 'join_lawyer_applications' })
export class JoinLawyerApplicationEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'int', array: true, name: 'legal_category_ids', default: () => 'ARRAY[]::integer[]' })
    legalCategoryIds: number[];

    @Column({ type: 'text', array: true, name: 'languages', default: () => 'ARRAY[]::text[]' })
    languages: string[];

    @Column({ type: 'int' })
    planYears: number;

    @Column({ type: 'int' })
    amountInr: number;

    @Column({ type: 'varchar', length: 80, nullable: true })
    firstName: string | null;

    @Column({ type: 'varchar', length: 80, nullable: true })
    lastName: string | null;

    @Column({ type: 'varchar', length: 6, nullable: true, default: '+91' })
    code: string | null;

    @Column({ type: 'varchar', length: 20, nullable: true })
    phone: string | null;

    @Column({ type: 'varchar', length: 150, nullable: true })
    email: string | null;

    @Column({ type: 'varchar', length: 120, nullable: true })
    state: string | null;

    @Column({ type: 'varchar', length: 120, nullable: true })
    primaryCity: string | null;

    @Column({ type: 'text', nullable: true })
    officeAddress: string | null;

    @Column({ type: 'varchar', length: 50, nullable: true })
    barCouncilEnrollmentNumber: string | null;

    @Column({ type: 'varchar', length: 120, nullable: true })
    barCouncilState: string | null;

    @Column({ type: 'int', nullable: true })
    yearsOfExperience: number | null;

    @Column({ type: 'varchar', length: 120, nullable: true })
    courtsOfPractice: string | null;

    @Column({ type: 'text', nullable: true })
    primaryExpertise: string | null;

    @Column({ type: 'bytea', nullable: true })
    photo: Buffer | null;

    @Column({ type: 'varchar', length: 60, nullable: true })
    photoMimeType: string | null;

    @Column({ type: 'boolean', default: false })
    consentAccepted: boolean;

    @Column({ type: 'timestamptz', nullable: true })
    consentAcceptedAt: Date | null;

    @Column({ type: 'int', nullable: true })
    phonepeConsultationId: number | null;

    @Column({ type: 'varchar', length: 40, nullable: true })
    @Index()
    merchantTransactionId: string | null;

    @Column({ type: 'varchar', length: 50, nullable: true })
    phonepeTransactionId: string | null;

    @Column({ name: 'payment_status', type: 'varchar', length: 20, default: 'DRAFT' })
    paymentStatus: 'DRAFT' | 'PENDING' | 'SUCCESS' | 'FAILED';

    @Column({ name: 'application_status', type: 'varchar', length: 20, default: 'DRAFT' })
    applicationStatus: 'DRAFT' | 'SUBMITTED' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';

    @Column({ name: 'user_id', type: 'uuid', nullable: true })
    @Index()
    userId: string | null;

    @ManyToOne(() => UserEntity, { nullable: true })
    @JoinColumn({ name: 'user_id' })
    user?: UserEntity | null;

    @Column({ type: 'jsonb', nullable: true })
    paymentRaw: any;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}