import React, { useState } from 'react';
import { useEditor } from '../editor/context';
import { useGenerateImage } from '../hooks/useApi';

interface ImageWidgetProps {
  onClose: () => void;
}

const ImageWidget: React.FC<ImageWidgetProps> = ({ onClose }) => {
  const [prompt, setPrompt] = useState('');
  const { editor } = useEditor()!;
  const generateImageMutation = useGenerateImage();

  const handleGenerateImage = async () => {
    if (!prompt.trim() || !editor) return;

    try {
      const response = await generateImageMutation.mutateAsync({ prompt });
      const imageUrl = response.data.imageUrl;
      
      // Insert image into the editor
      const doc = editor.doc;
      if (doc) {
        const pageBlocks = doc.getBlockByFlavour('affine:page');
        if (pageBlocks.length > 0) {
          const pageBlock = pageBlocks[0];
          
          let noteBlocks = doc.getBlockByFlavour('affine:note');
          let noteBlock;
          
          if (noteBlocks.length === 0) {
            const noteId = doc.addBlock('affine:note', {}, pageBlock.id);
            noteBlock = doc.getBlockById(noteId)!;
          } else {
            noteBlock = noteBlocks[0];
          }
          
          doc.addBlock('affine:image', {
            sourceId: imageUrl,
            caption: prompt,
            width: 400,
            height: 300,
          }, noteBlock.id);
        }
      }
      
      setPrompt('');
      onClose();
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleGenerateImage();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="image-widget-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="image-widget">
        <div className="image-widget-header">
          <h3>Generate Image</h3>
          <button 
            onClick={onClose} 
            className="close-button" 
            disabled={generateImageMutation.isLoading}
          >
            ×
          </button>
        </div>
        <div className="image-widget-content">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Describe the image you want to generate...&#10;&#10;Tip: Press Ctrl+Enter to generate or Escape to close"
            rows={4}
            disabled={generateImageMutation.isLoading}
            className="prompt-input"
            autoFocus
          />
          <div className="image-widget-actions">
            <button
              onClick={handleGenerateImage}
              disabled={!prompt.trim() || generateImageMutation.isLoading}
              className={`generate-button ${generateImageMutation.isLoading ? 'loading' : ''}`}
            >
              {generateImageMutation.isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Generating...
                </>
              ) : (
                'Generate Image'
              )}
            </button>
            <button 
              onClick={onClose} 
              className="cancel-button" 
              disabled={generateImageMutation.isLoading}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageWidget