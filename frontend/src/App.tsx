import { useEffect, useRef } from 'react';
import { PageEditor } from '@blocksuite/presets';

function App() {
  const editorRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (editorRef.current) {
      const editor = new PageEditor();
      editorRef.current.appendChild(editor);
      editor.doc.init();
    }
  }, []);

  return (
    <div className="App">
      <h1>Редактор BlockSuite</h1>
      <div ref={editorRef}></div>
    </div>
  );
}

export default App;

