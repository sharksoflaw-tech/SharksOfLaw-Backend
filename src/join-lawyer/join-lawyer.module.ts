import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JoinLawyerApplicationEntity } from './join-lawyer-application.entity';
import { JoinLawyerController } from './join-lawyer.controller';
import { JoinLawyerService } from './join-lawyer.service';
import { Consultation } from '../consultations/consultation.entity';
import {UsersModule} from "../users/users.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([JoinLawyerApplicationEntity]),
        UsersModule,
    ],
    controllers: [JoinLawyerController],
    providers: [JoinLawyerService],
    exports: [JoinLawyerService],
})
export class JoinLawyerModule {}