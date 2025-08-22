import { useEffect, useRef, useState } from 'react';
import { WebSocketService } from '../services/websocket';
import * as Y from 'yjs';

export const useWebSocket = (userId: string, yDoc: Y.Doc | null) => {
  const webSocketRef = useRef<WebSocketService | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId || !yDoc) return;

    webSocketRef.current = new WebSocketService(userId);

    // Обработчик состояния документа
    webSocketRef.current.onDocumentState((data) => {
      if (data.documentData) {
        const update = new Uint8Array(
          atob(data.documentData)
            .split('')
            .map(char => char.charCodeAt(0))
        );
        Y.applyUpdate(yDoc, update);
      }
    });

    // Обработчик обновлений документа
    webSocketRef.current.onDocumentUpdate((data) => {
      if (data.update) {
        const update = new Uint8Array(
          atob(data.update)
            .split('')
            .map(char => char.charCodeAt(0))
        );
        Y.applyUpdate(yDoc, update);
      }
    });

    // Отправка локальных изменений
    const updateHandler = (update: Uint8Array) => {
      const updateBase64 = btoa(String.fromCharCode(...update));
      webSocketRef.current?.sendDocumentUpdate(userId, updateBase64);
    };

    yDoc.on('update', updateHandler);
    setIsConnected(true);

    return () => {
      yDoc.off('update', updateHandler);
      webSocketRef.current?.disconnect();
      setIsConnected(false);
    };
  }, [userId, yDoc]);

  return { isConnected };
};