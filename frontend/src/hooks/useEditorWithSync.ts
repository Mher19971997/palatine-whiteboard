// useEditorWithSync.ts - полная интеграция редактора с синхронизацией
import { useEffect, useState, useRef } from 'react';
import * as Y from 'yjs';
import { AffineEditorContainer } from '@blocksuite/presets';
import { Doc, Schema } from '@blocksuite/store';
import { DocCollection } from '@blocksuite/store';
import { AffineSchemas } from '@blocksuite/blocks';
import { useAuth } from '../contexts/AuthContext';
import { base64ToUint8Array, useDocumentSync } from './useDocumentSync';
import { useDocument } from './useApi';

interface UseEditorWithSyncReturn {
  editor: AffineEditorContainer | null;
  collection: DocCollection | null;
  ydoc: Y.Doc;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  reloadDocument: () => Promise<void>;
}

export function useEditorWithSync(): UseEditorWithSyncReturn {
  const { isAuthenticated } = useAuth();
  const [editor, setEditor] = useState<AffineEditorContainer | null>(null);
  const [collection, setCollection] = useState<DocCollection | null>(null);
  const [ydoc] = useState(() => new Y.Doc());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isInitialized = useRef(false);
  const syncInProgress = useRef(false);

  // Загрузка документа с сервера
  const { data: documentData, refetch, isLoading: isDocumentLoading } = useDocument();

  // WebSocket синхронизация
  const { reloadDocument, isConnected } = useDocumentSync({
    doc: ydoc,
    onDocumentUpdate: (update) => {
      // Когда получили обновление от сервера, синхронизируем с BlockSuite
      if (!syncInProgress.current && editor?.doc) {
        syncYjsToBlockSuite();
      }
    },
  });

  // Инициализация BlockSuite редактора
  useEffect(() => {
    if (!isAuthenticated || isInitialized.current) return;

    try {
      const schema = new Schema().register(AffineSchemas);
      const newCollection = new DocCollection({ schema });
      newCollection.meta.initialize();

      const doc = newCollection.createDoc({ id: 'page1' });
      doc.load(() => {
        const pageBlockId = doc.addBlock('affine:page', {});
        doc.addBlock('affine:surface', {}, pageBlockId);
        const noteId = doc.addBlock('affine:note', {}, pageBlockId);
        doc.addBlock('affine:paragraph', {}, noteId);
      });

      const newEditor = new AffineEditorContainer();
      newEditor.doc = doc;

      // Обработка переходов по ссылкам
      newEditor.slots.docLinkClicked.on(({ docId }) => {
        const target = newCollection.getDoc(docId) as Doc;
        if (target) {
          newEditor.doc = target;
        }
      });

      setEditor(newEditor);
      setCollection(newCollection);
      isInitialized.current = true;

      console.log('BlockSuite editor initialized');
    } catch (err) {
      console.error('Failed to initialize editor:', err);
      setError('Failed to initialize editor');
    }
  }, [isAuthenticated]);

  // Загрузка данных документа в Yjs при старте
  useEffect(() => {
    console.log(documentData, 4444);
    if (!ydoc || !documentData || !isInitialized.current) return;

    try {
      setIsLoading(true);

      const base64Data = documentData?.data?.documentData;
      if (base64Data) {
        // Декодируем Base64 в Uint8Array
        console.log(base64Data, 7777777);
        const binaryData = base64ToUint8Array(base64Data.toString('base64'));

        // Применяем данные в Yjs
        ydoc.transact(() => {
          Y.applyUpdate(ydoc, binaryData);
        });

        // Синхронизируем с BlockSuite
        setTimeout(() => {
          syncYjsToBlockSuite();
          setIsLoading(false);
        }, 100);
      } else {
        setIsLoading(false);
      }

      console.log('Document data loaded into Yjs');
    } catch (err) {
      console.error('Failed to load document data:', err);
      setError('Failed to load document');
      setIsLoading(false);
    }
  }, [ydoc, documentData, isInitialized.current]);

  // Синхронизация от Yjs к BlockSuite
  const syncYjsToBlockSuite = () => {
    if (!editor?.doc || !ydoc || syncInProgress.current) return;

    syncInProgress.current = true;

    try {
      const yjsContent = ydoc.getMap('blocksuite');
      const serializedData = yjsContent.get('content');

      if (serializedData && typeof serializedData === 'string') {
        const data = JSON.parse(serializedData);

        if (data && data.blocks && Array.isArray(data.blocks)) {
          // Обновляем BlockSuite документ
          editor.doc.transact(() => {
            // Очищаем все блоки кроме корневой страницы
            const blocks = Array.from(editor.doc.getBlocks());
            blocks.forEach(block => {
              if (block.flavour !== 'affine:page') {
                try {
                  editor.doc.deleteBlock(block);
                } catch (e) {
                  // Игнорируем ошибки удаления
                }
              }
            });

            // Воссоздаем структуру
            const pageBlock = blocks.find(b => b.flavour === 'affine:page');
            if (pageBlock) {
              // Добавляем surface
              const surfaceId = editor.doc.addBlock('affine:surface', {}, pageBlock.id);
              // Добавляем note
              const noteId = editor.doc.addBlock('affine:note', {}, pageBlock.id);

              // Добавляем контент из данных
              data.blocks.forEach((blockData: any) => {
                try {
                  if (blockData.flavour && blockData.flavour !== 'affine:page'
                    && blockData.flavour !== 'affine:surface'
                    && blockData.flavour !== 'affine:note') {
                    editor.doc.addBlock(
                      blockData.flavour,
                      blockData.props || {},
                      noteId
                    );
                  }
                } catch (e) {
                  console.warn('Failed to add block:', blockData.flavour, e);
                }
              });
            }
          });

          console.log('Synced Yjs content to BlockSuite');
        }
      }
    } catch (err) {
      console.error('Failed to sync Yjs to BlockSuite:', err);
    } finally {
      syncInProgress.current = false;
    }
  };

  // Синхронизация от BlockSuite к Yjs
  const syncBlockSuiteToYjs = () => {
    if (!editor?.doc || !ydoc || syncInProgress.current) return;

    try {
      const blocks = Array.from(editor.doc.getBlocks());
      const serializedData = {
        blocks: blocks.map(block => ({
          id: block.id,
          flavour: block.flavour,
          props: block.props,
          parent: block.parent?.id || null,
        })),
        timestamp: Date.now(),
        version: documentData?.data?.version || 1,
      };

      const yjsContent = ydoc.getMap('blocksuite');
      yjsContent.set('content', JSON.stringify(serializedData));

      console.log('Synced BlockSuite to Yjs');
    } catch (err) {
      console.error('Failed to sync BlockSuite to Yjs:', err);
    }
  };

  // Подписка на изменения в BlockSuite
  useEffect(() => {
    if (!editor?.doc || !ydoc || !isInitialized.current) return;

    let debounceTimer: NodeJS.Timeout;

    const handleBlockSuiteChange = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (!syncInProgress.current) {
          syncBlockSuiteToYjs();
        }
      }, 500);
    };

    try {
      // Подписываемся на изменения в документе
      const disposable = editor.doc.slots.blockUpdated.on(handleBlockSuiteChange);

      return () => {
        clearTimeout(debounceTimer);
        disposable.dispose();
      };
    } catch (err) {
      console.error('Failed to setup BlockSuite listeners:', err);
    }
  }, [editor, ydoc, isInitialized.current]);

  const handleReloadDocument = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await reloadDocument();
      // После перезагрузки синхронизируем с BlockSuite
      setTimeout(() => {
        syncYjsToBlockSuite();
        setIsLoading(false);
      }, 100);
    } catch (err) {
      console.error('Failed to reload document:', err);
      setError('Failed to reload document');
      setIsLoading(false);
    }
  };

  return {
    editor,
    collection,
    ydoc,
    isConnected,
    isLoading: isLoading || isDocumentLoading,
    error,
    reloadDocument: handleReloadDocument,
  };
}