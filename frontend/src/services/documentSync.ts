import * as Y from 'yjs';
import { useUpdateDocument } from '@palatine_whiteboard_frontend/hooks';
import { base64ToUint8Array } from '@palatine_whiteboard_frontend/shared/utils';

export class DocumentSyncService {
  private doc: Y.Doc;
  private updateDocument: ReturnType<typeof useUpdateDocument>['mutate'];
  private version: number = 1;
  private saveTimeout: NodeJS.Timeout | null = null;
  private readonly SAVE_DEBOUNCE_MS = 2000;

  constructor(
    doc: Y.Doc,
    updateDocumentMutation: ReturnType<typeof useUpdateDocument>['mutate'],
    initialVersion = 1
  ) {
    this.doc = doc;
    this.updateDocument = updateDocumentMutation;
    this.version = initialVersion;
    this.setupUpdateListener();
  }

  private setupUpdateListener() {
    this.doc.on('update', (_update: Uint8Array) => {
      this.debouncedSave();
    });
  }

  private debouncedSave() {
    if (this.saveTimeout) clearTimeout(this.saveTimeout);

    this.saveTimeout = setTimeout(() => {
      this.saveDocument();
    }, this.SAVE_DEBOUNCE_MS);
  }

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

  private uint8ArrayToBase64(bytes: Uint8Array): string {
    let binary = '';
    const chunkSize = 0x8000; // 32KB
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }
    return btoa(binary);
  }

  public async loadDocument(base64Data: string) {
    try {
      if (!base64Data) throw new Error('No document data provided');

      const binaryData = base64ToUint8Array(base64Data);

      if (this.doc) {
        this.doc.destroy();
      }

      Y.applyUpdate(this.doc, binaryData);

      console.log('Document loaded successfully');
    } catch (err) {
      console.error('Failed to load document:', err);
    }
  }

  public destroy() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
  }
}