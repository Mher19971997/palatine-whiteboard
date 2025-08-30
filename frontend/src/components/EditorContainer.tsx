import { useEffect, useRef } from 'react';
import { useEditor } from '@palatine_whiteboard_frontend/editor/context';

const EditorContainer = () => {
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const { editor, error, isConnected, isLoading } = useEditor()!;


  useEffect(() => {
    if (editorContainerRef.current && editor) {
      editorContainerRef.current.innerHTML = '';
      editorContainerRef.current.appendChild(editor);
    }
  }, [editor]);

  if (error) {
    return (
      <div className="editor-error">
        <h3>❌ Editor Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="editor-wrapper">
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
      </div>
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