// import {forwardRef, Module} from "@nestjs/common";
// import { PhonePeService } from "./phonepe.service";
// import { PhonePeController } from "./phonepe.controller";
// import { TypeOrmModule } from "@nestjs/typeorm";
// import { Consultation } from "../consultations/consultation.entity";
// import {JoinLawyerModule} from "../join-lawyer/join-lawyer.module";
// import {JoinLawyerApplicationEntity} from "../join-lawyer/join-lawyer-application.entity";
//
// @Module({
//   imports: [TypeOrmModule.forFeature([JoinLawyerApplicationEntity, Consultation]),
//   forwardRef(() => JoinLawyerModule),
//   ],
//   controllers: [PhonePeController],
//   providers: [PhonePeService],
//   exports: [PhonePeService],
// })
// export class PhonePeModule {}
