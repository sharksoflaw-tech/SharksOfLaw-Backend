import { IsEnum } from 'class-validator';
import { UserRole } from '../../users/user.entity';

export class SetUserRoleDto {
    @IsEnum(UserRole)
    role: UserRole;
}