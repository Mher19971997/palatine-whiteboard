// src/image/image.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ImageService } from './image.service';
import { GenerateImageDto } from './dto/input/generate-image.dto';
import { ImageResponseDto } from './dto/output/image-response.dto';

@ApiTags('Images')
@Controller('api/images')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate image from text prompt' })
  @ApiResponse({ 
    status: 201, 
    description: 'Image generated successfully', 
    type: ImageResponseDto 
  })
  async generateImage(@Body() generateDto: GenerateImageDto): Promise<ImageResponseDto> {
    return this.imageService.generateImage(generateDto);
  }
}