import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Res,
    StreamableFile,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express, Response } from 'express';

import { JoinLawyerService } from './join-lawyer.service';
import { CreateJoinLawyerDto } from './dto/create-join-lawyer.dto';
import { UpdateJoinLawyerDto } from './dto/update-join-lawyer.dto';

@Controller('join-lawyer')
export class JoinLawyerController {
    constructor(private readonly svc: JoinLawyerService) {}

    @Post('applications')
    createDraft(@Body() dto: CreateJoinLawyerDto) {
        return this.svc.createDraft(dto);
    }

    @Get('applications/:id')
    get(@Param('id') id: string) {
        return this.svc.getById(id);
    }

    @Patch('applications/:id')
    update(@Param('id') id: string, @Body() dto: UpdateJoinLawyerDto) {
        return this.svc.update(id, dto);
    }

    @Post('applications/:id/photo')
    @UseInterceptors(
        FileInterceptor('file', {
            limits: { fileSize: 3 * 1024 * 1024 },
            fileFilter: (_req, file, cb) => {
                const ok = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
                cb(ok ? null : new BadRequestException('Only JPG/PNG/WEBP allowed'), ok);
            },
        }),
    )
    async uploadPhoto(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (!file) {
            throw new BadRequestException('Photo file is required');
        }

        return this.svc.setPhoto(id, {
            buffer: file.buffer,
            mimetype: file.mimetype,
            originalname: file.originalname,
        });
    }

    @Post('applications/:id/upload-bar-council-id')
    @UseInterceptors(FileInterceptor('file'))
    async uploadBarCouncilId(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (!file) {
            throw new BadRequestException('File is required');
        }

        return this.svc.uploadBarCouncilId(id, file);
    }

    @Get('applications/:id/photo')
    async getPhoto(
        @Param('id') id: string,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { photo, photoMimeType } = await this.svc.getPhoto(id);

        res.set({
            'Content-Type': photoMimeType || 'image/jpeg',
            'Cache-Control': 'public, max-age=3600',
        });

        return new StreamableFile(photo);
    }
}