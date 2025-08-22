// src/document/document.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Param, 
  Body, 
  NotFoundException 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/input/create-document.dto';
import { UpdateDocumentDto } from './dto/input/update-document.dto';
import { DocumentResponseDto } from './dto/output/document-response.dto';

@ApiTags('Documents')
@Controller('api/documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Get document by user ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Document found', 
    type: DocumentResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async getDocument(@Param('userId') userId: string): Promise<DocumentResponseDto> {
    const document = await this.documentService.getDocument(userId);
    
    if (!document) {
      throw new NotFoundException(`Document not found for user ${userId}`);
    }

    return document;
  }

  @Post()
  @ApiOperation({ summary: 'Create new document' })
  @ApiResponse({ 
    status: 201, 
    description: 'Document created', 
    type: DocumentResponseDto 
  })
  async createDocument(@Body() createDto: CreateDocumentDto): Promise<DocumentResponseDto> {
    return this.documentService.createDocument(createDto);
  }

  @Put(':userId')
  @ApiOperation({ summary: 'Update existing document' })
  @ApiResponse({ 
    status: 200, 
    description: 'Document updated', 
    type: DocumentResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 409, description: 'Version conflict' })
  async updateDocument(
    @Param('userId') userId: string,
    @Body() updateDto: UpdateDocumentDto,
  ): Promise<DocumentResponseDto> {
    return this.documentService.updateDocument(userId, updateDto);
  }
}