import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('testimonials')
export class Testimonial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column({ type: 'float' })
  rating: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true })
  photoUrl: string;

  @CreateDateColumn()
  createdAt: Date;
}
