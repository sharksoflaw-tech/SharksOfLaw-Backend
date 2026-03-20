// src/lawyers/lawyers.controller.ts
import {
    Controller,
    Get,
    Param,
    NotFoundException,
    Res,
    StreamableFile,
} from '@nestjs/common';
import type { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LawyerProfileEntity } from './lawyer-profile.entity';
import * as fs from 'fs';
import * as path from 'path';

@Controller('lawyers')
export class LawyersController {
    constructor(
        @InjectRepository(LawyerProfileEntity)
        private readonly lawyerRepo: Repository<LawyerProfileEntity>,
    ) {}

    @Get(':id/photo')
    async getPhoto(
        @Param('id') id: string,
        @Res({ passthrough: true }) res: Response,
    ) {
        const profile = await this.lawyerRepo.findOne({ where: { id } });

        if (!profile || !profile.photoPath) {
            throw new NotFoundException('Photo not found');
        }

        const absolutePath = path.resolve(profile.photoPath);

        if (!fs.existsSync(absolutePath)) {
            throw new NotFoundException('Photo file not found');
        }

        res.set({
            'Content-Type': profile.photoMimeType || 'application/octet-stream',
            'Cache-Control': 'public, max-age=3600',
        });

        return new StreamableFile(fs.createReadStream(absolutePath));
    }
}