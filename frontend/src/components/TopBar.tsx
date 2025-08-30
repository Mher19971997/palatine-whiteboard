import React from 'react';
import { useTheme } from '@palatine_whiteboard_frontend/hooks/useTheme';
import { useEditor } from '@palatine_whiteboard_frontend/editor/context';

interface TopBarProps {
  onMenuToggle?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuToggle }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { isConnected, } = useEditor()!;

  return (
    <header className="top-bar">
      <div className="top-bar-left">
        {onMenuToggle && (
          <button className="menu-btn btn btn-secondary" onClick={onMenuToggle}>
            ☰
          </button>
        )}
        <div className="logo">
          <div className="logo-icon">P</div>
          <span>Palatine Whiteboard</span>
        </div>
        <nav className="breadcrumb">
          <span>Document</span>
          <span className="breadcrumb-separator">•</span>
          <span>My Project</span>
        </nav>
      </div>

      <div className="top-bar-right">
        <div className={`status-indicator   ${isConnected ? 'status-online' : 'status-offline'}`}>
          <div className="status-dot"></div>
          <span>{isConnected ? 'Online' : 'Offline'}</span>
        </div>

        <button className="btn btn-secondary" onClick={toggleTheme}>
          <span>{isDarkMode ? '☀️' : '🌙'}</span>
          <span>{isDarkMode ? 'Light' : 'Dark'}</span>
        </button>
        <button className="btn btn-primary">
          <span>📤</span>
          <span>Share</span>
        </button>
      </div>
    </header>
  );
};

export default TopBar;