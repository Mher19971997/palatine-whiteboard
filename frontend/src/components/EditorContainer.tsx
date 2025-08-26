// EditorContainer.tsx - упрощенная версия
import { useEffect, useRef } from 'react';
import '@blocksuite/presets/themes/affine.css';
import { useEditorWithSync } from '../hooks/useEditorWithSync';

const EditorContainer = () => {
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const { 
    editor, 
    isConnected, 
    isLoading, 
    error, 
    reloadDocument 
  } = useEditorWithSync();

  // Монтируем редактор в DOM
  useEffect(() => {
    if (editorContainerRef.current && editor && !isLoading) {
      try {
        // Очищаем контейнер
        editorContainerRef.current.innerHTML = '';
        // Добавляем редактор
        editorContainerRef.current.appendChild(editor);
        console.log('Editor mounted to DOM');
      } catch (err) {
        console.error('Failed to mount editor:', err);
      }
    }
  }, [editor, isLoading]);

  if (error) {
    return (
      <div className="editor-error">
        <h3>❌ Editor Error</h3>
        <p>{error}</p>
        <button onClick={reloadDocument} className="retry-btn">
          🔄 Retry
        </button>
      </div>
    );
  }

  return (
    <div className="editor-wrapper">
      {/* Статус бар */}
      <div className="editor-status">
        <div className="status-items">
          <span className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '🟢 Online' : '🔴 Offline'}
          </span>
          
          {isLoading && (
            <span className="loading-status">
              ⏳ Loading...
            </span>
          )}
          
          <span className="sync-status">
            💾 Auto-save enabled
          </span>
        </div>
        
        <div className="status-actions">
          <button 
            onClick={reloadDocument} 
            className="reload-btn"
            disabled={isLoading}
          >
            🔄 Reload
          </button>
        </div>
      </div>

      {/* Контейнер редактора */}
      <div 
        className="editor-container" 
        ref={editorContainerRef}
      >
        {isLoading && !editor && (
          <div className="editor-loading">
            <div className="loading-spinner"></div>
            <p>Initializing editor...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorContainer;