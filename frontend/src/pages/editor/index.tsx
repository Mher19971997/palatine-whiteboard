import DocumentPanel from '@palatine_whiteboard_frontend/components/DocumentPanel';
import EditorContainer from '@palatine_whiteboard_frontend/components/EditorContainer';
import TopBar from '@palatine_whiteboard_frontend/components/TopBar';
import { EditorProvider } from '@palatine_whiteboard_frontend/editor/context';
import React, { useState } from 'react';

 export const EditorPage: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsPanelOpen(!isPanelOpen);
  };

  const handleDocumentAction = (action: string) => {
    switch (action) {
      case 'save':
        console.log('Saving document...');
        break;
      case 'export-pdf':
        console.log('Exporting to PDF...');
        break;
      case 'copy-link':
        console.log('Copying link...');
        break;
      case 'undo':
        console.log('Undo action...');
        break;
      case 'redo':
        console.log('Redo action...');
        break;
      case 'find-replace':
        console.log('Find & Replace...');
        break;
      case 'reading-mode':
        console.log('Switching to reading mode...');
        break;
      case 'mobile-preview':
        console.log('Mobile preview...');
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  return (
    <EditorProvider>
      <div className="app">
        <TopBar onMenuToggle={handleMenuToggle} />
        <div className="app-content">
          <DocumentPanel 
            className={isPanelOpen ? 'open' : ''}
            onAction={handleDocumentAction}
          />
          <EditorContainer />
        </div>
      </div>
    </EditorProvider>
  );
};

 