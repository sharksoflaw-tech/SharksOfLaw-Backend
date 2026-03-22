import { IsIn } from 'class-validator';

export class SetUserRoleDto {
    @IsIn(['CLIENT', 'LAWYER', 'ADMIN'])
    role: 'CLIENT' | 'LAWYER' | 'ADMIN';
}