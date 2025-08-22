import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { FilterService } from '@palatine_whiteboard_backend/shared/src/sequelize/filter.service';
import { ConfigService } from '@palatine_whiteboard_backend/shared/src/config/config.service';
import { CryptoService } from '@palatine_whiteboard_backend/shared/src/crypto/crypto.service';
import { CommonService } from '@palatine_whiteboard_backend/shared/src/sequelize/common.service';
import { Document } from '@palatine_whiteboard_backend/service/src/model/document/document';
import { documentDto } from '@palatine_whiteboard_backend/src/document/dto';
import { CacheService } from '@palatine_whiteboard_backend/shared/src/cache/cache.service';
import assert from 'assert';

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
    private readonly cryptoService: CryptoService,
    private readonly cacheService: CacheService,
    private readonly sequelize: Sequelize,
  ) {
    super({ model: documentModel, paginateService });
  }

  async getDocument(userUuid: string) {
    // 1. Проверяем Redis кеш
    const cacheKey = `${this.CACHE_PREFIX}${userUuid}`;
    const cached = await this.cacheService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    // 2. Загружаем из PostgreSQL
    const document = await this.findOne({
      userUuid,
    });

    if (!document) {
      return null;
    }

    const response = {
      id: document.id,
      userUuid: document.userUuid,
      documentData: document.documentData.toString('base64'),
      version: document.version,
      updatedAt: document.updatedAt.toISOString(),
    };

    // Кешируем результат
    await this.cacheService.set(cacheKey, this.CACHE_TTL, JSON.stringify(response));

    return response;
  }

  async createDocument(createDto: documentDto.inputs.CreateDocumentInput) {
    const documentData = Buffer.from(createDto.documentData, 'base64');

    const document = await this.create({
      userId: createDto.userId,
      documentData,
      version: createDto.version || 1,
    });

    const response = {
      id: document.id,
      userId: document.userId,
      documentData: createDto.documentData,
      version: document.version,
      updatedAt: document.updatedAt.toISOString(),
    };

    // Кешируем новый документ
    const cacheKey = `${this.CACHE_PREFIX}${createDto.userId}`;
    await this.cacheService.set(cacheKey, this.CACHE_TTL, JSON.stringify(response));

    return response;
  }

  async updateDocument(userUuid: string, updateDto: documentDto.inputs.UpdateDocumentInput) {
    const transaction = await this.sequelize.transaction();

    try {
      // Optimistic Concurrency Control
      const document = await this.findOne({
        userUuid,
        transaction,
      });
      assert(document, `Document not found for user ${userUuid}`)
      assert(document.version === updateDto.version, `Document version mismatch. Expected ${updateDto.version}, got ${document.version}`)


      const updateData = Buffer.from(updateDto.updateData, 'base64');

      await document.update(
        {
          documentData: updateData,
          version: document.version + 1,
        },
        { transaction },
      );

      await transaction.commit();

      const response = {
        id: document.id,
        userId: document.userId,
        documentData: updateDto.updateData,
        version: document.version,
        updatedAt: document.updatedAt.toISOString(),
      };

      // Обновляем кеш
      const cacheKey = `${this.CACHE_PREFIX}${userUuid}`;
      await this.cacheService.set(cacheKey, this.CACHE_TTL, JSON.stringify(response));

      return response;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Метод для сохранения Y.js updates с дебаунсингом
  async saveDocumentUpdate(userUuid: string, updateData: Buffer): Promise<void> {
    // Сохраняем в Redis немедленно
    const cacheKey = `${this.CACHE_PREFIX}${userUuid}:temp`;
    await this.cacheService.set(cacheKey, 300, updateData.toString('base64')); // 5 min TTL

    // Планируем сохранение в PostgreSQL с дебаунсингом
    this.schedulePostgresSave(userUuid, updateData);
  }

  private schedulePostgresSave(userUuid: string, data: Buffer): void {
    // Отменяем предыдущий таймер, если есть
    const existingTimeout = this.saveTimeouts.get(userUuid);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Устанавливаем новый таймер на 30 секунд
    const timeout = setTimeout(async () => {
      try {
        const document = await this.findOne({
          userUuid
        });

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

        // Очищаем временный кеш
        const tempCacheKey = `${this.CACHE_PREFIX}${userUuid}:temp`;
        await this.cacheService.del(tempCacheKey);

        // Обновляем основной кеш
        const cacheKey = `${this.CACHE_PREFIX}${userUuid}`;
        await this.cacheService.del(cacheKey);

        this.saveTimeouts.delete(userUuid);
      } catch (error) {
        console.error(`Failed to save document for user ${userUuid}:`, error);
      }
    }, 30000);

    this.saveTimeouts.set(userUuid, timeout);
  }
}