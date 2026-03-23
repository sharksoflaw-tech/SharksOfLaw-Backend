import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LawyersModule } from "./lawyers/lawyers.module";
import { ConsultationsModule } from "./consultations/consultations.module";
import { ContactModule } from "./contact/contact.module";
import { TestimonialsModule } from "./testimonials/testimonials.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { HealthModule } from "./health/health.module";
import {JoinLawyerModule} from "./join-lawyer/join-lawyer.module";
import {UsersModule} from "./users/users.module";
import {PaymentsModule} from "./payments/payments.module";
import {AdminModule} from "./admin/admin.module";
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true,
      ssl: { rejectUnauthorized: false },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), process.env.UPLOAD_ROOT || '/data/uploads'),
      serveRoot: '/data/uploads',
    }),
    AuthModule,
    UsersModule,
    PaymentsModule,
    AdminModule,
    JoinLawyerModule,
    HealthModule,
    // PhonePeModule,
    LawyersModule,
    ConsultationsModule,
    ContactModule,
    TestimonialsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
