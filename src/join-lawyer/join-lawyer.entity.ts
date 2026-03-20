import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import {UserEntity} from "../users/user.entity";

export type JoinLawyerApplicationStatus = 'DRAFT' | 'SUBMITTED' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';

@Entity({ name: 'join_lawyer_applications' })
export class JoinLawyerEntity {
    @PrimaryGeneratedColumn()
    id: string;

    @Column({ name: 'user_id', type: 'uuid', nullable: true })
    userId: string | null;

    @ManyToOne(() => UserEntity, { nullable: true })
    @JoinColumn({ name: 'user_id' })
    user?: UserEntity | null;

    @Column({ type: 'int', array: true, name: 'legal_category_ids', default: () => 'ARRAY[]::integer[]' })
    legalCategoryIds: number[];

    @Column({ type: 'text', array: true, name: 'languages', default: () => 'ARRAY[]::text[]' })
    languages: string[];

    @Column({ name: 'selected_plan', type: 'varchar', length: 20 })
    selectedPlan: string; // starter | growth | pro

    @Column({ name: 'first_name', type: 'varchar', length: 80, nullable: true })
    firstName: string | null;

    @Column({ name: 'last_name', type: 'varchar', length: 80, nullable: true })
    lastName: string | null;

    @Column({ name: 'phone', type: 'varchar', length: 10, nullable: true })
    phone: string | null;

    @Column({ name: 'code', type: 'varchar', length: 10, nullable: true })
    code: string | null;

    @Column({ name: 'email', type: 'varchar', length: 150, nullable: true })
    email: string | null;

    @Column({ name: 'city', type: 'varchar', length: 120, nullable: true })
    city: string | null;

    @Column({ name: 'state', type: 'varchar', length: 120, nullable: true })
    state: string | null;

    @Column({ name: 'office_address', type: 'text', nullable: true })
    officeAddress: string | null;

    @Column({ name: 'bar_council_enrollment_number', type: 'varchar', length: 50, nullable: true })
    barCouncilEnrollmentNumber: string | null;

    @Column({ name: 'bar_council_state', type: 'varchar', length: 120, nullable: true })
    barCouncilState: string | null;

    @Column({ name: 'years_of_experience', type: 'int', nullable: true })
    yearsOfExperience: number | null;

    @Column({ name: 'court_of_practice', type: 'varchar', length: 500, nullable: true })
    courtsOfPractice: string | null;

    @Column({ name: 'photo_file_name', type: 'varchar', length: 255, nullable: true })
    photoFileName: string | null;

    @Column({ name: 'photo_mime_type', type: 'varchar', length: 60, nullable: true })
    photoMimeType: string | null;

    @Column({ name: 'photo_path', type: 'text', nullable: true })
    photoPath: string | null;

    @Column({ name: 'bar_council_id_file_name', type: 'text', nullable: true })
    barCouncilIdFileName: string | null;

    @Column({ name: 'bar_council_id_mime_type', type: 'text', nullable: true })
    barCouncilIdMimeType: string | null;

    @Column({ name: 'bar_council_id_path', type: 'text', nullable: true })
    barCouncilIdPath: string | null;

    @Column({ name: 'consent_accepted', type: 'boolean', default: false })
    consentAccepted: boolean;

    @Column({ name: 'consent_accepted_at', type: 'timestamptz', nullable: true })
    consentAcceptedAt: Date | null;

    @Column({ name: 'status', type: 'varchar', length: 20, default: 'DRAFT' })
    status: JoinLawyerApplicationStatus;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}