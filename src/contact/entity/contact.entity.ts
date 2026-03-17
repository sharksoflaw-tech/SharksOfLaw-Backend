import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
} from "typeorm";

@Entity("contact_requests")
export class ContactRequest {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    fullName: string;

    @Column()
    phone: string;

    @Column({ nullable: true })
    email: string;

    @Column({ type: "text", nullable: true })
    message: string;

    @CreateDateColumn()
    createdAt: Date;
}