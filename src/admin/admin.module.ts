import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminLawyersController } from './admin-lawyers.controller';
import { AdminUsersController } from './admin-users.controller';
import { AdminPaymentsController } from './admin-payments.controller';

import { JoinLawyerApplicationEntity } from '../join-lawyer/join-lawyer-application.entity';
import { LawyerProfileEntity } from '../lawyers/lawyer-profile.entity';
import { UserEntity } from '../users/user.entity';
import { PaymentEntity } from '../payments/payment.entity';
import { PaymentAttemptEntity } from '../payments/payment-attempt.entity';

import { UsersModule } from '../users/users.module';
import {JoinLawyerModule} from "../join-lawyer/join-lawyer.module";
import {LawyersModule} from "../lawyers/lawyers.module";
import {LawyersService} from "../lawyers/lawyers.service";

@Module({
    imports: [
        UsersModule,
        TypeOrmModule.forFeature([
            JoinLawyerApplicationEntity,
            LawyerProfileEntity,
            UserEntity,
            PaymentEntity,
            PaymentAttemptEntity,
            JoinLawyerModule,
            LawyersModule,
        ]),
    ],
    controllers: [
        AdminLawyersController,
        AdminUsersController,
        AdminPaymentsController,
    ],
    providers: [LawyersService],
})
export class AdminModule {}