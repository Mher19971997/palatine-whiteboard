import React from 'react';
import { useTheme } from '../hooks/useTheme';

interface DocumentStats {
  words: number;
  characters: number;
  lastModified: string;
}

interface DocumentPanelProps {
  documentStats?: DocumentStats;
  onAction?: (action: string) => void;
}

const DocumentPanel: React.FC<DocumentPanelProps> = ({ 
  documentStats = { words: 1247, characters: 6832, lastModified: '2 minutes ago' },
  onAction 
}) => {
  const { isDarkMode, toggleTheme } = useTheme();

  const handleAction = (action: string) => {
    console.log(`Action: ${action}`);
    onAction?.(action);
  };

  return (
    <aside className="document-panel">
      <div className="panel-header">
        <h2 className="panel-title">Current Document</h2>
        <button 
          className="theme-toggle" 
          onClick={toggleTheme} 
          title="Toggle theme"
        >
          <span>{isDarkMode ? '☀️' : '🌙'}</span>
        </button>
      </div>

      <div className="document-info">
        <div className="current-doc">
          <div className="doc-header">
            <div className="doc-icon">📄</div>
            <div className="doc-details">
              <h3>My Project Document</h3>
              <div className="doc-meta">Last edited {documentStats.lastModified}</div>
            </div>
          </div>

          <div className="doc-stats">
            <div className="stat-item">
              <div className="stat-value">{documentStats.words.toLocaleString()}</div>
              <div className="stat-label">Words</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{documentStats.characters.toLocaleString()}</div>
              <div className="stat-label">Characters</div>
            </div>
          </div>
        </div>

        <div className="document-actions">
          <div className="action-section">
            <div className="action-title">File Actions</div>
            <div className="action-buttons">
              <button className="action-btn" onClick={() => handleAction('save')}>
                <span>💾</span>
                Save Document
              </button>
              <button className="action-btn" onClick={() => handleAction('export-pdf')}>
                <span>📤</span>
                Export PDF
              </button>
              <button className="action-btn" onClick={() => handleAction('copy-link')}>
                <span>📋</span>
                Copy Link
              </button>
            </div>
          </div>

          <div className="action-section">
            <div className="action-title">Edit</div>
            <div className="action-buttons">
              <button className="action-btn" onClick={() => handleAction('undo')}>
                <span>🔄</span>
                Undo
              </button>
              <button className="action-btn" onClick={() => handleAction('redo')}>
                <span>🔁</span>
                Redo
              </button>
              <button className="action-btn" onClick={() => handleAction('find-replace')}>
                <span>🔍</span>
                Find & Replace
              </button>
            </div>
          </div>

          <div className="action-section">
            <div className="action-title">View</div>
            <div className="action-buttons">
              <button className="action-btn" onClick={() => handleAction('reading-mode')}>
                <span>👁️</span>
                Reading Mode
              </button>
              <button className="action-btn" onClick={() => handleAction('mobile-preview')}>
                <span>📱</span>
                Mobile Preview
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default DocumentPanel;
