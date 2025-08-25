import React, { useState } from 'react';
import ImageWidget from './ImageWidget';
import { useAuth } from '../contexts/AuthContext';

const TopBar = () => {
  const [showImageWidget, setShowImageWidget] = useState(false);
  const { logout } = useAuth();

  return (
    <>
      <div className="top-bar">
        <div className="top-bar-title">Palatine Editor</div>
        <div className="top-bar-actions">
          <button
            className="toolbar-btn"
            onClick={() => setShowImageWidget(true)}
            title="Generate Image"
          >
            🖼️ Generate Image
          </button>
          <button
            className="toolbar-btn logout-btn"
            onClick={logout}
            title="Logout"
          >
            Logout
          </button>
        </div>
      </div>

      {showImageWidget && (
        <ImageWidget onClose={() => setShowImageWidget(false)} />
      )}
    </>
  );
};

export default TopBar