// src/image/image.controller.ts
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ImageService } from './image.service';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Images')
@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) { }

  @Post('generate')
  @UseGuards(RolesGuard)
  async generateImage(@Body() generateDto: any) {
    return this.imageService.generateImage(generateDto);
  }
}