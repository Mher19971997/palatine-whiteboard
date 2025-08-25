import * as Y from 'yjs';
import { useUpdateDocument } from '../hooks/useApi';

export class DocumentSyncService {
  private doc: Y.Doc;
  private userUuid: string;
  private updateDocument: ReturnType<typeof useUpdateDocument>['mutate'];
  private version: number = 1;
  private saveTimeout: NodeJS.Timeout | null = null;
  private readonly SAVE_DEBOUNCE_MS = 5000; // 5 seconds

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

  private setupUpdateListener() {
    this.doc.on('update', (update: Uint8Array) => {
      this.debouncedSave(update);
    });
  }

  private debouncedSave(update: Uint8Array) {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(() => {
      this.saveDocument();
    }, this.SAVE_DEBOUNCE_MS);
  }

  private async saveDocument() {
    try {
      const docState = Y.encodeStateAsUpdate(this.doc);
      const base64Data = btoa(String.fromCharCode(...docState));

      this.updateDocument({
        userUuid: this.userUuid,
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

  public loadDocument(base64Data: string) {
    try {
      const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      Y.applyUpdate(this.doc, binaryData);
    } catch (error) {
      console.error('Failed to load document:', error);
    }
  }

  public destroy() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
  }
}