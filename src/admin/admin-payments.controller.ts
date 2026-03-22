import {Controller, Get, Param, Query, UseGuards} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';

import {PaymentEntity} from '../payments/payment.entity';
import {PaymentAttemptEntity} from '../payments/payment-attempt.entity';

import { UserRole } from '../users/user.entity';
import {Roles} from './roles.decorator';
import {RolesGuard} from './roles.guard';

@Controller('admin/payments')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminPaymentsController {
    constructor(
        @InjectRepository(PaymentEntity)
        private readonly paymentsRepo: Repository<PaymentEntity>,
        @InjectRepository(PaymentAttemptEntity)
        private readonly attemptsRepo: Repository<PaymentAttemptEntity>,
    ) {
    }

    @Get()
    list(@Query('status') status?: 'PENDING' | 'SUCCESS' | 'FAILED') {
        const where = status ? {status} : {};
        return this.paymentsRepo.find({
            where,
            order: {createdAt: 'DESC'},
        });
    }

    @Get(':id')
    async get(@Param('id') id: string) {
        const payment = await this.paymentsRepo.findOne({where: {id}});
        const attempts = await this.attemptsRepo.find({
            where: {paymentId: id},
            order: {createdAt: 'DESC'},
        });
        return {payment, attempts};
    }
}