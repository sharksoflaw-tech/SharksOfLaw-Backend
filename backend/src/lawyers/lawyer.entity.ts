import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";

@Entity("lawyers")
export class Lawyer {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    fullName: string;

    @Column()
    avatarInitials: string; // e.g., AS, RK

    @Column()
    expertise: string; // e.g., Criminal, Divorce

    @Column()
    practiceArea: string; // slug: criminal | divorce | property…

    @Column()
    experienceYears: number;

    @Column()
    city: string;

    @Column({ type: "float", default: 4.5 })
    rating: number;

    @Column({ default: true })
    verified: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}