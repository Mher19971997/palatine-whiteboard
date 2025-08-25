import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DocumentService } from './document.service';
import { documentDto } from './dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { BearerUser } from '../user/dto/output';
import { decorator } from '@palatine_whiteboard_backend/shared/src/decorator';
import ms from 'ms';

@ApiTags('Documents')
@Controller('document')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) { }

  @Get()
  @UseGuards(RolesGuard)
  // @decorator.cache.Store({ ttl: ms('1h') })
  async findOne(
    @decorator.user.User() user: BearerUser,
  ) {
    return this.documentService.findOne({ userUuid: user.userUuid });
  }

  @Get()
  @UseGuards(RolesGuard)
  async findAll(@decorator.user.User() user: BearerUser) {
    return this.documentService.findAll({
      userUuid: user.userUuid,
      queryMeta: { order: { createdAt: 'DESC' } },
    });
  }

  @Post()
  @UseGuards(RolesGuard)
  async createDocument(
    @decorator.user.User() user: BearerUser,
    @Body() createDto: documentDto.inputs.CreateDocumentInput,
  ) {
    return this.documentService.createDocument({
      userUuid: user.userUuid,
      ...createDto,
    });
  }

  @Put()
  @UseGuards(RolesGuard)
  async updateDocument(
    @decorator.user.User() user: BearerUser,
    @Body() updateDto: documentDto.inputs.UpdateDocumentInput,
  ) {
    return this.documentService.updateDocument(user, updateDto);
  }
}
