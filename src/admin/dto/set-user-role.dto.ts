import { IsIn, IsString } from 'class-validator';

export class SetUserRoleDto {
    @IsString()
    @IsIn(['CLIENT', 'LAWYER', 'ADMIN'])
    role: 'CLIENT' | 'LAWYER' | 'ADMIN';
}