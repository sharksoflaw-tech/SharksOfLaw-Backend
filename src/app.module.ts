import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LawyersModule } from './lawyers/lawyers.module';
import { LegalIssuesModule } from './legal-issues/legal-issues.module';
import { ConsultationsModule } from './consultations/consultations.module';
import { ContactModule } from './contact/contact.module';
import { TestimonialsModule } from './testimonials/testimonials.module';
import { PhonePeModule } from "./payments-phonepe/phonepe.module";
import {AppController} from "./app.controller";
import {AppService} from "./app.service";
import {HealthModule} from "./health/health.module";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true,
      ssl: { rejectUnauthorized: false },
    }),
    HealthModule,
    PhonePeModule,
    LawyersModule,
    LegalIssuesModule,
    ConsultationsModule,
    ContactModule,
    TestimonialsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
