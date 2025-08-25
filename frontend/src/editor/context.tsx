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

// ------------------- EditorProvider -------------------
export function EditorProvider({ children }: EditorProviderProps) {
  const { userUuid } = useAuth();
  const { data: documentData } = useDocument(userUuid || '');
  const createDocumentMutation = useCreateDocument();
  const updateDocumentMutation = useUpdateDocument();

  const { editor, collection } = useMemo(() => initEditor(), []);

  const hasCreatedRef = useRef(false);

  // ------------------- Конвертация буфера в Base64 -------------------
  function bufferToBase64(bufferObj: { type: string; data: number[] }) {
    const uint8 = new Uint8Array(bufferObj.data);
    const chunkSize = 0x8000; // 32KB
    let binary = '';
    for (let i = 0; i < uint8.length; i += chunkSize) {
      const chunk = uint8.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }
    return btoa(binary);
  }
  const versionRef = useRef<number>(documentData?.version || 1);

  useEffect(() => {
    if (!userUuid || !editor.doc.spaceDoc) return;

    let syncService: DocumentSyncService | null = null;

    const init = async () => {
      if (documentData?.documentData) {
        versionRef.current = documentData.version || 1;

        syncService = new DocumentSyncService(
          editor.doc.spaceDoc,
          userUuid,
          (update) => updateDocumentMutation.mutate({ data: { updateData: update, version: versionRef.current } }),
          versionRef.current
        );

        await syncService.loadDocument(bufferToBase64(documentData.documentData));
      } else if (!hasCreatedRef.current) {
        const docState = Y.encodeStateAsUpdate(editor.doc.spaceDoc);
        if (docState.length === 0) return; // пропускаем

        const base64Data = bufferToBase64({ type: 'Buffer', data: Array.from(docState) });

        createDocumentMutation.mutate({
          userId: userUuid,
          documentData: base64Data,
          version: 1,
        }, {
          onSuccess: (res) => {
            versionRef.current = res.version;
          }
        });

        hasCreatedRef.current = true;

        syncService = new DocumentSyncService(
          editor.doc.spaceDoc,
          userUuid,
          (update) => updateDocumentMutation.mutate({ data: { updateData: update, version: versionRef.current } }),
          1
        );
      }
    };

    init();

    return () => syncService?.destroy();
  }, [userUuid, documentData?.documentData, editor.doc.spaceDoc]);

  return (
    <EditorContext.Provider value={{ editor, collection }}>
      {children}
    </EditorContext.Provider>
  );
}
