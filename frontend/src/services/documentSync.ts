import * as Y from 'yjs';
import { useUpdateDocument } from '../hooks/useApi';

export class DocumentSyncService {
  private doc: Y.Doc;
  private userUuid: string;
  private updateDocument: ReturnType<typeof useUpdateDocument>['mutate'];
  private version: number = 1;
  private saveTimeout: NodeJS.Timeout | null = null;
  private readonly SAVE_DEBOUNCE_MS = 5000; // 5 секунд

  constructor(
    doc: Y.Doc,
    userUuid: string,
    updateDocumentMutation: ReturnType<typeof useUpdateDocument>['mutate'],
    initialVersion = 1
  ) {
    this.doc = doc;
    this.userUuid = userUuid;
    this.updateDocument = updateDocumentMutation;
    this.version = initialVersion;

    this.setupUpdateListener();
  }

  // ------------------- Слушатель изменений -------------------
  private setupUpdateListener() {
    this.doc.on('update', (_update: Uint8Array) => {
      this.debouncedSave();
    });
  }

  // ------------------- Дебаунс сохранения -------------------
  private debouncedSave() {
    if (this.saveTimeout) clearTimeout(this.saveTimeout);

    this.saveTimeout = setTimeout(() => {
      this.saveDocument();
    }, this.SAVE_DEBOUNCE_MS);
  }

  // ------------------- Сохранение документа -------------------
private saveDocument() {
  try {
    const docState = Y.encodeStateAsUpdate(this.doc);

    if (docState.length === 0) {
      console.log('⚠️ Empty update, skipping save');
      return;
    }

    const base64Data = this.uint8ArrayToBase64(docState);
    this.updateDocument({
      data: {
        updateData: base64Data,
        version: this.version,
      },
    });

    this.version += 1;
  } catch (error) {
    console.error('Failed to save document:', error);
  }
}

  // ------------------- Безопасная конвертация Uint8Array → Base64 -------------------
  private uint8ArrayToBase64(bytes: Uint8Array): string {
    let binary = '';
    const chunkSize = 0x8000; // 32KB
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }
    return btoa(binary);
  }

  // ------------------- Безопасная конвертация Base64 → Uint8Array -------------------
  private base64ToUint8Array(base64: string): Uint8Array {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    const chunkSize = 0x8000; // 32KB
    for (let i = 0; i < len; i += chunkSize) {
      const chunk = binary.slice(i, i + chunkSize);
      for (let j = 0; j < chunk.length; j++) {
        bytes[i + j] = chunk.charCodeAt(j);
      }
    }
    return bytes;
  }

  // ------------------- Загрузка документа -------------------
  public async loadDocument(base64Data: string) {
    try {
      if (!base64Data) throw new Error('No document data provided');

      const binaryData = this.base64ToUint8Array(base64Data);
      // Применяем обновление Yjs напрямую
      // Это полностью синхронизирует документ с сервером
      Y.applyUpdate(this.doc, binaryData);

      console.log('Document loaded successfully');
    } catch (err) {
      console.error('Failed to load document:', err);
    }
  }


  // ------------------- Очистка -------------------
  public destroy() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
  }
}
