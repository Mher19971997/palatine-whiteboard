import React, { useEffect, useRef, useState } from 'react';
import { useEditor } from '../editor/context';
import ImageWidget from '@palatine_whiteboard_frontend/components/ImageWidget';

const EditorContainer: React.FC = () => {
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const { editor, error, isLoading } = useEditor()!;
  const [showImageWidget, setShowImageWidget] = useState(false);

  useEffect(() => {
    if (editorContainerRef.current && editor) {
      editorContainerRef.current.innerHTML = '';
      editorContainerRef.current.appendChild(editor);
    }
  }, [editor]);

  if (error) {
    return (
      <div className="editor-error">
        <div className="error-icon">❌</div>
        <h3 className="error-title">Editor Error</h3>
        <p className="error-message">{error}</p>
        <button className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="editor-wrapper">
        <div className="editor-toolbar">
          <button className="btn btn-secondary">
            <span>🎨</span>
            Format
          </button>
          <button className="btn btn-secondary" onClick={() => setShowImageWidget(true)}>
            <span>📷</span>
            Image
          </button>
          <button className="btn btn-secondary">
            <span>📊</span>
            Table
          </button>
          <button className="btn btn-secondary">
            <span>🔗</span>
            Link
          </button>
        </div>

        <div className="editor-container" ref={editorContainerRef}>
          {isLoading && !editor && (
            <div className="editor-loading">
              <div className="loading-spinner"></div>
              <p>Initializing editor...</p>
            </div>
          )}
        </div>
      </div>
      {showImageWidget && (
        <ImageWidget onClose={() => setShowImageWidget(false)} />
      )}
    </>
  );
};

export default EditorContainer;