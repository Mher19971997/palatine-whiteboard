import { useEffect, useRef } from "react";
import * as Y from "yjs";
import { useAuth } from "../contexts/AuthContext";
import { useDocument } from "../hooks/useApi";
import { io, Socket } from "socket.io-client";

// ------------------- Утилиты для кодирования -------------------
export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000; // 32KB
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

export function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

interface UseDocumentSyncProps {
  doc: Y.Doc;
  onDocumentUpdate?: (update: Uint8Array) => void;
}

export function useDocumentSync({ doc, onDocumentUpdate }: UseDocumentSyncProps) {
  const { isAuthenticated } = useAuth();
  const { data: documentData, refetch } = useDocument("");
  const socketRef = useRef<Socket | null>(null);
  const isInitialLoadRef = useRef(true);

  // ------------------- Загрузка документа при старте -------------------
  useEffect(() => {
    if (!doc || !documentData || !isInitialLoadRef.current) return;

    try {
      if (documentData.documentData) {
        const binaryData = base64ToUint8Array(documentData.documentData);

        doc.transact(() => {
          Y.applyUpdate(doc, binaryData);
        });

        console.log("✅ Document loaded from server");
      }
      isInitialLoadRef.current = false;
    } catch (error) {
      console.error("❌ Failed to load document:", error);
    }
  }, [doc, documentData]);

  // ------------------- WebSocket подключение -------------------
  useEffect(() => {
    if (!isAuthenticated) return;

    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) return;

    const socket = io("http://localhost:6001", {
      query: { token: accessToken },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🔌 WS connected");
    });

    socket.on("disconnect", (reason) => {
      console.log("⚠️ WS disconnected:", reason);
    });

    // Пришел апдейт от другого клиента
    socket.on("documentUpdated", (data: { userUuid: string; updateData: string }) => {
      try {
        const binary = base64ToUint8Array(data.updateData);
        console.log(55555, binary);

        // применяем как "remote"
        doc.transact(() => {
          Y.applyUpdate(doc, binary);
        }, "remote");

        console.log("📥 Applied remote update");

        if (onDocumentUpdate) {
          onDocumentUpdate(binary);
        }
      } catch (error) {
        console.error("❌ Failed to apply remote update:", error);
      }
    });
    function bufferToBase64(bufferObj: { type: string; data: number[] }) {
      const uint8 = new Uint8Array(bufferObj.data);
      const chunkSize = 0x8000; // 32KB
      let binary = '';
      for (let i = 0; i < uint8.length; i += chunkSize) {
        const chunk = uint8.subarray(i, i + chunkSize);
        binary += String.fromCharCode(...chunk);
      }
      return btoa(binary);
    }
    // Обработчик локальных изменений
    const updateHandler = (update: Uint8Array, origin: any) => {
      if (origin === "remote") return; // не шлем свои же апдейты

      try {
        console.log(update, 44444444);
        const base64Data = bufferToBase64({ type: 'Buffer', data: Array.from(update) });
        socket.emit("updateDocument", { updateData: base64Data });
        console.log("📤 Sent local update to server", update);
      } catch (error) {
        console.error("❌ Failed to send update:", error);
      }
    };

    doc.on("update", updateHandler);

    return () => {
      doc.off("update", updateHandler);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [doc, isAuthenticated, onDocumentUpdate]);

  // ------------------- Метод для ручной перезагрузки -------------------
  const reloadDocument = async () => {
    try {
      const freshData = await refetch();

      if (freshData?.data?.documentData) {
        const binary = base64ToUint8Array(freshData.data.documentData);

        doc.transact(() => {
          // не делай doc.destroy() — иначе потеряешь ссылки
          doc.clear(); // или можно просто поверх применить state
          Y.applyUpdate(doc, binary);
        });

        console.log("🔄 Document reloaded");
      }
    } catch (error) {
      console.error("❌ Failed to reload document:", error);
    }
  };

  return {
    reloadDocument,
    socket: socketRef.current,
    isConnected: socketRef.current?.connected || false,
  };
}
