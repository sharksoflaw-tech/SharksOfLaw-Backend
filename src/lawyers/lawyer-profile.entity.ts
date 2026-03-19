// src/lawyers/lawyer-profile.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity({ name: 'lawyer_profiles' })
export class LawyerProfileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Link to the main user identity
  @Index({ unique: true })
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  // Display info
  @Column({ name: 'display_name', type: 'varchar', length: 160 })
  displayName: string;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  // Photo (copied from application on approval)
  @Column({ type: 'bytea', nullable: true })
  photo: Buffer | null;

  @Column({ name: 'photo_mime', type: 'varchar', length: 60, nullable: true })
  photoMime: string | null;

  // Practice details
  @Column({
    name: 'legal_category_ids',
    type: 'int',
    array: true,
    default: () => 'ARRAY[]::integer[]',
  })
  legalCategoryIds: number[];

  @Column({
    type: 'text',
    array: true,
    default: () => 'ARRAY[]::text[]',
  })
  languages: string[];

  @Column({ type: 'varchar', length: 80, nullable: true })
  city: string | null;

  // Visibility
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}