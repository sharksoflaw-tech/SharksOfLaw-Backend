import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum UserRole {
    CLIENT = 'CLIENT',
    LAWYER = 'LAWYER',
    ADMIN = 'ADMIN',
}

@Entity({ name: 'users' })
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index({ unique: true })
    @Column({ name: 'mobile', type: 'varchar', length: 20 })
    mobileE164: string;

    @Column({ name: 'password_hash', type: 'varchar', length: 255, nullable: true })
    passwordHash?: string;

    @Column({ type: 'varchar', length: 150, nullable: true })
    email: string | null;

    @Column({ name: 'first_name', type: 'varchar', length: 100, nullable: true })
    firstName?: string;

    @Column({ name: 'last_name', type: 'varchar', length: 100, nullable: true })
    lastName?: string;

    @Column({
        type: 'text',
        array: true,
        default: [UserRole.CLIENT],
    })
    roles: UserRole[];

    @Column({ name: 'mobile_verified', type: 'boolean', default: false })
    mobileVerified: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
