import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JoinLawyerEntity } from './join-lawyer.entity';
import { JoinLawyerController } from './join-lawyer.controller';
import { JoinLawyerService } from './join-lawyer.service';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([JoinLawyerEntity]),
        UsersModule,
    ],
    controllers: [JoinLawyerController],
    providers: [JoinLawyerService],
    exports: [JoinLawyerService],
})
export class JoinLawyerModule {}