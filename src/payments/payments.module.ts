// src/payments/payments.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PaymentEntity } from './payment.entity';
import { PaymentAttemptEntity } from './payment-attempt.entity';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PhonePeClient } from './phonepe.client';
import { Consultation } from '../consultations/consultations.entity';
import { JoinLawyerEntity } from '../join-lawyer/join-lawyer.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            PaymentEntity,
            PaymentAttemptEntity,
            Consultation,
            JoinLawyerEntity,
        ]),
    ],
    controllers: [PaymentsController],
    providers: [
        PaymentsService,
        PhonePeClient,
    ],
    exports: [
        PaymentsService, // used by admin or other modules if needed
    ],
})
export class PaymentsModule {}