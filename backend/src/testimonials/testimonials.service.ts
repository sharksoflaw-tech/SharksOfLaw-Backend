import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Testimonial } from './testimonial.entity';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';

@Injectable()
export class TestimonialsService {
  constructor(
    @InjectRepository(Testimonial)
    private readonly repo: Repository<Testimonial>,
  ) {}

  findAll() {
    return this.repo.find({
      order: { createdAt: 'DESC' },
    });
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  create(dto: CreateTestimonialDto) {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async update(id: number, dto: UpdateTestimonialDto) {
    const record = await this.findOne(id);
    if (!record) throw new NotFoundException('Testimonial not found');
    Object.assign(record, dto);
    return this.repo.save(record);
  }

  async remove(id: number) {
    const res = await this.repo.delete(id);
    if (!res.affected) throw new NotFoundException('Testimonial not found');
  }
}
