import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FilterService } from '@palatine_whiteboard_backend/shared/src/sequelize/filter.service';
import { ConfigService } from '@palatine_whiteboard_backend/shared/src/config/config.service';
import { CommonService } from '@palatine_whiteboard_backend/shared/src/sequelize/common.service';
import { Document } from '@palatine_whiteboard_backend/service/src/model/document/document';
import { documentDto } from '@palatine_whiteboard_backend/src/document/dto';
import { CacheService } from '@palatine_whiteboard_backend/shared/src/cache/cache.service';
import assert from 'assert';
import { BearerUser } from '../user/dto/output';

@Injectable()
export class DocumentService extends CommonService<
  Document,
  documentDto.inputs.CreateDocumentInput,
  documentDto.inputs.FilterDocumentInput,
  documentDto.inputs.UpdateDocumentInput,
  documentDto.outputs.DocumentEntity
> {
  private readonly CACHE_TTL = 3600; // 1 hour
  private readonly CACHE_PREFIX = 'doc:';
  private readonly saveTimeouts = new Map<string, NodeJS.Timeout>();

  constructor(
    @InjectModel(Document)
    private readonly documentModel: typeof Document,
    private readonly paginateService: FilterService,
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
  ) {
    super({ model: documentModel, paginateService });
  }

  async getDocument(userUuid: string) {
    const cacheKey = `${this.CACHE_PREFIX}${userUuid}`;
    const cached = await this.cacheService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const document = await this.findOne({ userUuid });
    if (!document) {
      return null;
    }

    const response = {
      uuid: document.uuid,
      userUuid: document.userUuid,
      documentData: document.documentData,
      version: document.version,
      updatedAt: document.updatedAt.toISOString(),
    };

    await this.cacheService.set(cacheKey, this.CACHE_TTL, JSON.stringify(response));
    return response;
  }

  async createDocument(createDto: documentDto.inputs.CreateDocumentInput) {
    const existing = await this.findOne({ userUuid: createDto.userUuid });
    if (existing) {
      return existing;
    }

    const document = await this.create({
      userUuid: createDto.userUuid,
      //@ts-ignore
      documentData: Buffer.from(createDto.documentData, 'base64'),
      version: createDto.version || 1,
    });

    const response = {
      uuid: document.uuid,
      userUuid: document.userUuid,
      documentData: createDto.documentData,
      version: document.version,
      updatedAt: document.updatedAt.toISOString(),
    };

    const cacheKey = `${this.CACHE_PREFIX}${createDto.userUuid}`;
    await this.cacheService.set(cacheKey, this.CACHE_TTL, JSON.stringify(response));

    return response;
  }

  async updateDocument(user: BearerUser, updateDto: documentDto.inputs.UpdateDocumentInput) {
    const document = await this.findOne({ userUuid: user.userUuid });
    assert(document, `Document not found for uuid ${user.userUuid}`);

    // if (updateDto.version && document.version !== updateDto.version) {
    //   throw new ConflictException(
    //     `Document version mismatch. Expected ${updateDto.version}, got ${document.version}`,
    //   );
    // }

    await this.update(
      { uuid: document.uuid },
      {
        documentData: Buffer.from(updateDto.updateData, 'base64'),
        version: document.version + 1,
      },
    );

    // Инвалидация кеша
    const cacheKey = `${this.CACHE_PREFIX}${document.userUuid}`;
    await this.cacheService.del(cacheKey);

    // Возвращаем свежий документ
    return this.findOne({ userUuid: user.userUuid });
  }


  async saveDocumentUpdate(userUuid: string, updateData: Buffer): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}${userUuid}:temp`;
    await this.cacheService.set(cacheKey, 300, updateData.toString('base64')); // 5 min TTL
    this.schedulePostgresSave(userUuid, updateData);
  }

  private schedulePostgresSave(userUuid: string, data: Buffer): void {
    const existingTimeout = this.saveTimeouts.get(userUuid);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    const timeout = setTimeout(async () => {
      try {
        const document = await this.findOne({ userUuid });

        if (document) {
          await document.update({
            documentData: data,
            version: document.version + 1,
          });
        } else {
          await this.create({
            userUuid,
            documentData: data,
            version: 1,
          });
        }

        await this.cacheService.del(`${this.CACHE_PREFIX}${userUuid}:temp`);
        await this.cacheService.del(`${this.CACHE_PREFIX}${userUuid}`);
        this.saveTimeouts.delete(userUuid);
      } catch (error) {
        console.error(`Failed to save document for user ${userUuid}:`, error);
      }
    }, 30_000);

    this.saveTimeouts.set(userUuid, timeout);
  }
}
