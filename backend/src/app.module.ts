import { LawyersModule } from './lawyers/lawyers.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LegalIssuesModule } from './legal-issues/legal-issues.module';
import { ConsultationsModule } from './consultations/consultations.module';
import { ContactModule } from './contact/contact.module';
import { TestimonialsModule } from './testimonials/testimonials.module';
import { PhonePeModule } from "./payments-phonepe/phonepe.module";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true,
    }),
    PhonePeModule,
    LawyersModule,
    LegalIssuesModule,
    ConsultationsModule,
    ContactModule,
    TestimonialsModule,
  ],
})
export class AppModule {}
