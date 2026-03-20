// src/lawyers/lawyers.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../users/user.entity';

@Entity({ name: 'lawyer_profiles' })
export class LawyersEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'display_name', type: 'varchar', length: 160 })
  displayName: string;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  // File-storage based photo metadata
  @Column({ name: 'photo_path', type: 'varchar', length: 500, nullable: true })
  photoPath: string | null;

  @Column({ name: 'photo_mime_type', type: 'varchar', length: 120, nullable: true })
  photoMimeType: string | null;

  @Column({ name: 'photo_file_name', type: 'varchar', length: 255, nullable: true })
  photoFileName: string | null;

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

  @Column({ type: 'varchar', length: 80, nullable: true })
  state: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}