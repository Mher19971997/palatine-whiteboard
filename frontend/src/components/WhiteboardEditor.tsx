import React, { useEffect, useRef, useState } from 'react';
import { EditorContainer } from '@blocksuite/editor';
import { AffineSchemas } from '@blocksuite/blocks';
import * as Y from 'yjs';
import { getUserId } from '../utils/user';
import { DocumentService } from '../services/document';
import { useWebSocket } from '../hooks/useWebSocket';
import { ImageGenerationWidget } from './ImageGenerationWidget';
import { LoadingSpinner } from './LoadingSpinner';

export const WhiteboardEditor: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EditorContainer | null>(null);
  const documentServiceRef = useRef<DocumentService | null>(null);
  
  const [yDoc, setYDoc] = useState<Y.Doc | null>(null);
  const [workspace, setWorkspace] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const userId = getUserId();
  const { isConnected } = useWebSocket(userId, yDoc);

  useEffect(() => {
    let mounted = true;

    const initializeEditor = async () => {
      try {
        if (!containerRef.current) return;

        // Создаем DocumentService и Y.js документ
        const documentService = new DocumentService(userId);
        documentServiceRef.current = documentService;
        
        const doc = documentService.getYDoc();
        setYDoc(doc);

        // Загружаем сохраненный документ
        await documentService.loadDocument();

        if (!mounted) return;

        // Создаем workspace с Y.js интеграцией
        //@ts-ignore
        const workspace = new Workspace({ schema: AffineSchemas });
        
        //@ts-ignore
        workspace.registerProvider('affine:page', doc);

        setWorkspace(workspace);

        // Создаем или получаем страницу
        let page = workspace.getPage('page:home');
        if (!page) {
          page = workspace.createPage({ id: 'page:home' });
        }

        if (!mounted) return;

        // Инициализируем редактор
        const editor = new EditorContainer();
        editor.page = page;
        containerRef.current.appendChild(editor);
        editorRef.current = editor;

        setIsLoading(false);
      } catch (err: any) {
        console.error('Failed to initialize editor:', err);
        if (mounted) {
          setError(err.message || 'Failed to initialize editor');
          setIsLoading(false);
        }
      }
    };

    initializeEditor();

    return () => {
      mounted = false;
      if (editorRef.current) {
        editorRef.current.remove();
      }
      if (documentServiceRef.current) {
        documentServiceRef.current.destroy();
      }
    };
  }, [userId]);

  const handleImageGenerated = (imageUrl: string) => {
    if (!workspace || !editorRef.current) return;

    try {
      const page = workspace.getPage('page:home');
      if (!page) return;

      // Создаем элемент изображения в BlockSuite
      const imageId = page.addBlock('affine:image', {
        sourceId: imageUrl,
        width: 400,
        height: 300,
      });

      console.log('Image added to document:', imageId);
    } catch (error) {
      console.error('Failed to add image to document:', error);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-2">⚠️ Error</div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="large" message="Initializing whiteboard..." />
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen">
      {/* Connection Status */}
      <div className="absolute top-4 left-4 z-40">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
          isConnected 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-yellow-500'
          }`}></div>
          {isConnected ? 'Connected' : 'Connecting...'}
        </div>
      </div>

      {/* Image Generation Widget */}
      <ImageGenerationWidget 
        userId={userId} 
        onImageGenerated={handleImageGenerated} 
      />

      {/* BlockSuite Editor Container */}
      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ 
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      />
    </div>
  );
};