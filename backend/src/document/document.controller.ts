// src/document/document.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  NotFoundException,
  UseGuards
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DocumentService } from './document.service';
import { documentDto } from './dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { BearerUser } from '../user/dto/output';
import { decorator } from '@palatine_whiteboard_backend/shared/src/decorator';

@ApiTags('Documents')
@Controller('document')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) { }

  @Get(':userId')
  async getDocument(@Param('userId') userId: string) {
    const document = await this.documentService.getDocument(userId);

    if (!document) {
      throw new NotFoundException(`Document not found for user ${userId}`);
    }

    return document;
  }

  @Post()
  @UseGuards(RolesGuard)
  async createDocument(@decorator.user.User() user: BearerUser, @Body() createDto: documentDto.inputs.CreateDocumentInput) {
    return this.documentService.createDocument({ userUuid: user.userUuid, ...createDto });
  }

  @Put(':userId')
  async updateDocument(
    @Param('userId') userId: string,
    @Body() updateDto: documentDto.inputs.UpdateDocumentInput,
  ) {
    return this.documentService.updateDocument(userId, updateDto);
  }
}