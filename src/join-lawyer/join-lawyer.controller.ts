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
import { ParseIntPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express, Response } from 'express';
import { memoryStorage } from 'multer';

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
  get(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getById(id);
  }

  @Patch('applications/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateJoinLawyerDto,
  ) {
    return this.svc.update(id, dto);
  }

  @Post('applications/:id/photo')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 3 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const ok = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
        cb(ok ? null : new BadRequestException('Only JPG/PNG/WEBP allowed'), ok);
      },
    }),
  )
  async uploadPhoto(
    @Param('id', ParseIntPipe) id: number,
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

  @Get('applications/:id/photo')
  async getPhoto(
    @Param('id', ParseIntPipe) id: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.svc.getPhoto(id);

    res.set({
      'Content-Type': result.photoMimeType,
      'Cache-Control': 'public, max-age=3600',
      'Content-Disposition': 'inline',
    });

    return new StreamableFile(result.photo);
  }

  @Post('applications/:id/upload-bar-council-id')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const ok = [
          'image/jpeg',
          'image/png',
          'image/webp',
          'application/pdf',
        ].includes(file.mimetype);

        cb(ok ? null : new BadRequestException('Only JPG, PNG, WEBP, PDF allowed'), ok);
      },
    }),
  )
  async setBarCouncilId(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.svc.setBarCouncilId(id, {
      buffer: file.buffer,
      mimetype: file.mimetype,
      originalname: file.originalname,
    });
  }

  @Get('applications/:id/bar-council-id')
  async getBarCouncilId(
    @Param('id', ParseIntPipe) id: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { file, mimeType, fileName } = await this.svc.getBarCouncilId(id);

    res.set({
      'Content-Type': mimeType,
      'Cache-Control': 'public, max-age=3600',
      'Content-Disposition': `inline; filename="${fileName}"`,
    });

    return new StreamableFile(file);
  }
}