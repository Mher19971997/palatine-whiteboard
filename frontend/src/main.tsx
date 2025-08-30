import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@palatine_whiteboard_frontend/App.tsx'
import '@blocksuite/presets/themes/affine.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
