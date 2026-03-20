import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminLawyersController } from './admin-lawyers.controller';
import { AdminUsersController } from './admin-users.controller';
import { AdminPaymentsController } from './admin-payments.controller';

import { JoinLawyerEntity } from '../join-lawyer/join-lawyer.entity';
import { LawyerProfileEntity } from '../lawyers/lawyer-profile.entity';
import { UserEntity } from '../users/user.entity';
import { PaymentEntity } from '../payments/payment.entity';
import { PaymentAttemptEntity } from '../payments/payment-attempt.entity';

import { UsersModule } from '../users/users.module';
import {JoinLawyerModule} from "../join-lawyer/join-lawyer.module";
import {LawyersModule} from "../lawyers/lawyers.module";
import {RolesGuard} from "./roles.guard";

@Module({
    imports: [
        UsersModule,
        JoinLawyerModule,
        LawyersModule,
        TypeOrmModule.forFeature([
            JoinLawyerEntity,
            LawyerProfileEntity,
            UserEntity,
            PaymentEntity,
            PaymentAttemptEntity,
        ]),
    ],
    controllers: [
        AdminLawyersController,
        AdminUsersController,
        AdminPaymentsController,
    ],
    providers: [RolesGuard],
})
export class AdminModule {}