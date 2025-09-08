import React, { useState } from 'react';
import { useEditor } from '@palatine_whiteboard_frontend/editor/context';
import { useGenerateImage } from '@palatine_whiteboard_frontend/hooks';

interface ImageWidgetProps {
  onClose: () => void;
}

const ImageWidget: React.FC<ImageWidgetProps> = ({ onClose }) => {
  const [prompt, setPrompt] = useState('');
  const { editor, isLoading: editorLoading } = useEditor() || {};
  const generateImageMutation = useGenerateImage() as any;

  const handleGenerateImage = async () => {
    if (!prompt.trim() || !editor || !editor.doc) return;

    try {
      const response = await generateImageMutation.mutateAsync({ prompt });
      const imageUrl = response?.data?.imageUrl;

      if (!imageUrl) {
        console.error('Image generation returned empty URL', response);
        return;
      }

      const doc = editor.doc;

      // Создаем страницу, если ее нет
      let pageBlocks = doc.getBlockByFlavour('affine:page');
      let pageBlock = pageBlocks[0];
      if (!pageBlock) {
        const pageId = doc.addBlock('affine:page', {});
        pageBlock = doc.getBlockById(pageId)!;
      }

      // Создаем заметку, если ее нет
      let noteBlocks = doc.getBlockByFlavour('affine:note');
      let noteBlock = noteBlocks[0];
      if (!noteBlock) {
        const noteId = doc.addBlock('affine:note', {}, pageBlock.id);
        noteBlock = doc.getBlockById(noteId)!;
      }

      // Добавляем изображение
      doc.addBlock('affine:image', {
        sourceId: imageUrl,
        caption: prompt,
        width: 400,
        height: 300,
      }, noteBlock.id);

      setPrompt('');
      onClose();
    } catch (error) {
      console.error('Failed to generate image:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) handleGenerateImage();
    if (e.key === 'Escape') onClose();
  };

  if (editorLoading || !editor) return null;

  return (
    <div className="image-widget-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="image-widget">
        <div className="image-widget-header">
          <h3>Generate Image</h3>
          <button
            onClick={onClose}
            className="close-button"
            disabled={generateImageMutation.isLoading}
          >×</button>
        </div>
        <div className="image-widget-content">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Describe the image you want to generate... Ctrl+Enter to generate, Esc to close"
            rows={4}
            disabled={generateImageMutation.isLoading}
            autoFocus
          />
          <div className="image-widget-actions">
            <button
              onClick={handleGenerateImage}
              disabled={!prompt.trim() || generateImageMutation.isLoading}
            >
              {generateImageMutation.isLoading ? 'Generating...' : 'Generate Image'}
            </button>
            <button
              onClick={onClose}
              disabled={generateImageMutation.isLoading}
            >Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageWidget;
