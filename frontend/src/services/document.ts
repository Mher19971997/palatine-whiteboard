import * as Y from 'yjs';
import { ApiService } from './api';

export class DocumentService {
  private yDoc: Y.Doc;
  private userId: string;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor(userId: string) {
    this.userId = userId;
    this.yDoc = new Y.Doc();
    this.setupAutoSave();
  }

  getYDoc(): Y.Doc {
    return this.yDoc;
  }

  async loadDocument(): Promise<void> {
    try {
      const documentData = await ApiService.getDocument(this.userId);
      
      if (documentData?.documentData) {
        const update = new Uint8Array(
          atob(documentData.documentData)
            .split('')
            .map(char => char.charCodeAt(0))
        );
        Y.applyUpdate(this.yDoc, update);
      }
    } catch (error) {
      console.error('Failed to load document:', error);
    }
  }

  private setupAutoSave(): void {
    this.yDoc.on('update', (update: Uint8Array) => {
      this.scheduleDocumentSave(update);
    });
  }

  private scheduleDocumentSave(update: Uint8Array): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(() => {
      this.saveDocument(update);
    }, 1000); // Дебаунсинг на 1 секунду
  }

  private async saveDocument(update: Uint8Array): Promise<void> {
    try {
      const updateBase64 = btoa(String.fromCharCode(...update));
      
      // Попробуем обновить существующий документ
      const existingDoc = await ApiService.getDocument(this.userId);
      
      if (existingDoc) {
        await ApiService.updateDocument(this.userId, updateBase64, existingDoc.version);
      } else {
        // Создаем новый документ
        const stateVector = Y.encodeStateAsUpdate(this.yDoc);
        const stateBase64 = btoa(String.fromCharCode(...stateVector));
        await ApiService.createDocument(this.userId, stateBase64);
      }
    } catch (error) {
      console.error('Failed to save document:', error);
    }
  }

  destroy(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
  }
}