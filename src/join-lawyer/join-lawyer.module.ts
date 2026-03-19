import {forwardRef, Module} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JoinLawyerApplicationEntity } from './join-lawyer-application.entity';
import { JoinLawyerController } from './join-lawyer.controller';
import { JoinLawyerService } from './join-lawyer.service';
// import { PhonePeModule } from '../payments-phonepe/phonepe.module';
import { PaymentsModule } from '../payments/payments.module'
import { Consultation } from '../consultations/consultation.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([JoinLawyerApplicationEntity, Consultation]),
        // forwardRef(() => PhonePeModule),
        forwardRef(() => PaymentsModule),
    ],
    controllers: [JoinLawyerController],
    providers: [JoinLawyerService],
    exports: [JoinLawyerService],
})
export class JoinLawyerModule {}