import { AffineEditorContainer } from '@blocksuite/presets';
import { DocCollection } from '@blocksuite/store';
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as Y from 'yjs';
import { useAuth } from '@palatine_whiteboard_frontend/contexts/AuthContext';
import { useDocument, useCreateDocument, useDocumentSync } from '@palatine_whiteboard_frontend/hooks';
import { DocumentSyncService } from '@palatine_whiteboard_frontend/services/documentSync';
import { initEditor } from '@palatine_whiteboard_frontend/editor/editor';
import { bufferToBase64 } from '@palatine_whiteboard_frontend/shared/utils';

export const EditorContext = createContext<{
  editor: AffineEditorContainer;
  collection: DocCollection;
  ydoc?: Y.Doc;
  isConnected?: boolean;
  isLoading?: boolean;
  error?: string | null;
} | null>(null);

export function useEditor() {
  return useContext(EditorContext);
}

interface EditorProviderProps {
  children: React.ReactNode;
}

export function EditorProvider({ children }: EditorProviderProps) {
  const { userUuid } = useAuth();
  const { data: documentData } = useDocument();
  const createDocumentMutation = useCreateDocument();

  const { editor, collection } = useMemo(() => initEditor(), []);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hasCreatedRef = useRef(false);

  const versionRef = useRef<number>(documentData?.data?.version || 1);
  const { sendUpdate, isConnected } = useDocumentSync({ doc: editor.doc.spaceDoc });

  useEffect(() => {
    if (!editor.doc.spaceDoc) return;

    let syncService: DocumentSyncService | null = null;

    const init = async () => {
      if (documentData?.data?.documentData) {
        versionRef.current = documentData?.data?.version || 1;

        syncService = new DocumentSyncService(
          editor.doc.spaceDoc,
          (update: any) => sendUpdate(update),
          versionRef.current
        );

        await syncService.loadDocument(bufferToBase64(documentData?.data?.documentData));
        setIsLoading(false)
      } else if (!hasCreatedRef.current) {
        const docState = Y.encodeStateAsUpdate(editor.doc.spaceDoc);
        if (docState.length === 0) return;

        const base64Data = bufferToBase64({ type: 'Buffer', data: Array.from(docState) });

        createDocumentMutation.mutate({
          documentData: base64Data,
          version: 1,
        }, {
          onSuccess: (res) => {
            versionRef.current = res.data.version;
          }
        });

        hasCreatedRef.current = true;

        syncService = new DocumentSyncService(
          editor.doc.spaceDoc,
          (update: any) => sendUpdate(update),
          1
        );
        setIsLoading(false)
      }
    };

    init();

    return () => syncService?.destroy();
  }, [userUuid, documentData?.data?.documentData, editor.doc.spaceDoc]);

  return (
    <EditorContext.Provider value={{ editor, collection, error, isLoading, isConnected }}>
      {children}
    </EditorContext.Provider>
  );
}
