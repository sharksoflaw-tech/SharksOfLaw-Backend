import {
    Body, Controller, Get, Param, Patch, Post, Req,
    UploadedFile, UseInterceptors, BadRequestException, Res, StreamableFile
} from '@nestjs/common';
import {FileInterceptor} from '@nestjs/platform-express';
import type {Response, Express} from 'express';
import {JoinLawyerService} from './join-lawyer.service';
import {CreateJoinLawyerDto} from './dto/create-join-lawyer.dto';
import {UpdateJoinLawyerDto} from './dto/update-join-lawyer.dto';

@Controller('join-lawyer')
export class JoinLawyerController {
    constructor(private readonly service: JoinLawyerService) {
    }

    @Post('applications')
    createDraft(@Body() dto: CreateJoinLawyerDto) {
        return this.service.createDraft(dto);
    }

    @Get('applications/:id')
    get(@Param('id') id: string) {
        return this.service.getById(id);
    }

    @Patch('applications/:id')
    update(@Param('id') id: string, @Body() dto: UpdateJoinLawyerDto) {
        return this.service.update(id, dto);
    }

    // ✅ Upload photo (BYTEA)
    @Post('applications/:id/photo')
    @UseInterceptors(
        FileInterceptor('file', {
            limits: {fileSize: 3 * 1024 * 1024}, // 3MB
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
        if (!file) throw new BadRequestException('Photo file is required');
        await this.service.setPhoto(id, file.buffer, file.mimetype);
        return {success: true};
    }

    // ✅ Fetch photo (binary response)
    @Get('applications/:id/photo')
    async getPhoto(@Param('id') id: string, @Res({passthrough: true}) res: Response) {
        const {photo, photoMimeType} = await this.service.getPhoto(id);
        if (!photo) throw new BadRequestException('Photo not found');

        res.set({
            'Content-Type': photoMimeType || 'image/jpeg',
            'Cache-Control': 'public, max-age=3600',
        });

        return new StreamableFile(photo);
    }

    @Post('applications/:id/payments/phonepe')
    async pay(@Param('id') id: string, @Req() req: any) {
        const frontendBaseUrl = process.env.FRONTEND_URL!;
        const backendBaseUrl = process.env.BACKEND_URL!;
        return this.service.initiatePayment(id, frontendBaseUrl, backendBaseUrl);
    }
}