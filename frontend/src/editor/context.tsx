import { AffineEditorContainer } from '@blocksuite/presets';
import { DocCollection } from '@blocksuite/store';
import { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import * as Y from 'yjs';
import { useAuth } from '../contexts/AuthContext';
import { useDocument, useCreateDocument, useUpdateDocument } from '../hooks/useApi';
import { DocumentSyncService } from '../services/documentSync';
import { initEditor } from './editor';

export const EditorContext = createContext<{
  editor: AffineEditorContainer;
  collection: DocCollection;
} | null>(null);

export function useEditor() {
  return useContext(EditorContext);
}

interface EditorProviderProps {
  children: React.ReactNode;
}

// Функция безопасного преобразования Uint8Array в Base64
function uint8ArrayToBase64(bytes: Uint8Array) {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}



export function EditorProvider({ children }: EditorProviderProps) {
  const { userUuid } = useAuth();
  const { data: documentData } = useDocument(userUuid || '');
  const createDocumentMutation = useCreateDocument();
  const updateDocumentMutation = useUpdateDocument();

  const { editor, collection } = useMemo(() => initEditor(), []);

  // useRef для хранения флага, чтобы создать документ только один раз
  const hasCreatedRef = useRef(false);
  function bufferToBase64(bufferObj: { type: string, data: number[] }) {
    const uint8 = new Uint8Array(bufferObj.data);
    let binary = '';
    for (let i = 0; i < uint8.length; i++) {
      binary += String.fromCharCode(uint8[i]);
    }
    return btoa(binary);
  }


  useEffect(() => {
    if (!userUuid) return;

    let syncService: DocumentSyncService | null = null;

    if (documentData?.documentData) {
      syncService = new DocumentSyncService(
        editor.doc.spaceDoc,
        userUuid,
        updateDocumentMutation.mutate,
        documentData?.version
      );
      try {
        syncService.loadDocument(bufferToBase64(documentData?.documentData));
      } catch (err) {
        console.error('Failed to load document:', err);
      }
    } else if (!hasCreatedRef.current) {
      const docState = Y.encodeStateAsUpdate(editor.doc.spaceDoc);
      const base64Data = uint8ArrayToBase64(docState);

      createDocumentMutation.mutate({
        userId: userUuid,
        documentData: base64Data,
        version: 1,
      });

      hasCreatedRef.current = true;

      syncService = new DocumentSyncService(
        editor.doc.spaceDoc,
        userUuid,
        updateDocumentMutation.mutate,
        1
      );
    }

    return () => {
      syncService?.destroy();
    };
  }, [userUuid, documentData?.documentData]);


  return (
    <EditorContext.Provider value={{ editor, collection }}>
      {children}
    </EditorContext.Provider>
  );
}
