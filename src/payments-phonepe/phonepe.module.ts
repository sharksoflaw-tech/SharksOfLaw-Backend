import {forwardRef, Module} from "@nestjs/common";
import { PhonePeService } from "./phonepe.service";
import { PhonePeController } from "./phonepe.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Consultation } from "../consultations/consultation.entity";
import {JoinLawyerModule} from "../join-lawyer/join-lawyer.module";

@Module({
  imports: [TypeOrmModule.forFeature([Consultation]), forwardRef(() => JoinLawyerModule)],
  controllers: [PhonePeController],
  providers: [PhonePeService],
})
export class PhonePeModule {}
