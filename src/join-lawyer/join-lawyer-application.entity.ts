import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';

export type JoinLawyerPaymentStatus =
    | 'DRAFT'
    | 'PENDING'
    | 'SUCCESS'
    | 'FAILED';

export type JoinLawyerApplicationStatus =
    | 'DRAFT'
    | 'SUBMITTED'
    | 'ACTIVE'
    | 'REJECTED';

@Entity({ name: 'join_lawyer_applications' })
export class JoinLawyerApplicationEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // Step 1 (MULTI SELECT)
    @Column({ type: 'int', array: true, name: 'legal_category_ids', default: () => 'ARRAY[]::integer[]' })
    legalCategoryIds: number[];

    @Column({ type: 'text', array: true, name: 'languages', default: () => 'ARRAY[]::text[]' })
    languages: string[];

    @Column({ type: 'int' })
    planYears: number; // 1 | 2 | 3

    @Column({ type: 'int' })
    amountInr: number; // 499 | 899 | 1499

    // Step 2 Basic Info
    @Column({ type: 'varchar', length: 80, nullable: true })
    firstName: string | null;

    @Column({ type: 'varchar', length: 80, nullable: true })
    lastName: string | null;

    @Column({ type: 'varchar', length: 20, nullable: true })
    phone: string | null;

    @Column({ type: 'varchar', length: 150, nullable: true })
    email: string | null;

    @Column({ type: 'varchar', length: 120, nullable: true })
    primaryCity: string | null;

    @Column({ type: 'text', nullable: true })
    officeAddress: string | null;

    // Step 3 Member Details
    @Column({ type: 'varchar', length: 50, nullable: true })
    barCouncilEnrollmentNumber: string | null;

    @Column({ type: 'varchar', length: 120, nullable: true })
    barCouncilState: string | null;

    @Column({ type: 'int', nullable: true })
    yearsOfExperience: number | null;

    @Column({ type: 'varchar', length: 120, nullable: true })
    courtsOfPractice: string | null; // store as string or CSV

    @Column({ type: 'text', nullable: true })
    primaryExpertise: string | null; // CSV or JSON string

    // Step 4 Photo (stored in Postgres as BYTEA)
    @Column({ type: 'bytea', nullable: true })
    photo: Buffer | null;

    @Column({ type: 'varchar', length: 60, nullable: true })
    photoMimeType: string | null;

    // Step 5 Consent
    @Column({ type: 'boolean', default: false })
    consentAccepted: boolean;

    @Column({ type: 'timestamptz', nullable: true })
    consentAcceptedAt: Date | null;

    // Link to consultation payment row (so we can use existing phonepeService)
    @Column({ type: 'int', nullable: true })
    phonepeConsultationId: number | null;

    // Payment tracking
    @Column({ type: 'varchar', length: 40, nullable: true })
    @Index()
    merchantTransactionId: string | null;

    @Column({ type: 'varchar', length: 50, nullable: true })
    phonepeTransactionId: string | null;

    @Column({ type: 'varchar', length: 20, default: 'DRAFT' })
    paymentStatus: JoinLawyerPaymentStatus;

    @Column({ type: 'varchar', length: 20, default: 'DRAFT' })
    applicationStatus: JoinLawyerApplicationStatus;

    @Column({ type: 'jsonb', nullable: true })
    paymentRaw: any;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}