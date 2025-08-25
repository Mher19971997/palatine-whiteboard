// src/image/image.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ImageService } from './image.service';

@ApiTags('Images')
@Controller('api/images')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate image from text prompt' })

  async generateImage(@Body() generateDto: any){
    return this.imageService.generateImage(generateDto);
  }
}