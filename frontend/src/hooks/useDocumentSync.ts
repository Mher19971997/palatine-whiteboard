import { useEffect, useRef } from "react";
import { useAuth } from "@palatine_whiteboard_frontend/contexts/AuthContext";
import { base64ToUint8Array } from "@palatine_whiteboard_frontend/shared/utils";
import { useDocument } from "@palatine_whiteboard_frontend/hooks";
import { io, Socket } from "socket.io-client";
import * as Y from 'yjs';

export function useDocumentSync({ doc, onDocumentUpdate }: any) {
  const { isAuthenticated } = useAuth();
  const { data: documentData } = useDocument();
  const socketRef = useRef<Socket | null>(null);
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    if (!doc || !documentData || !isInitialLoadRef.current) return;

    try {
      if (documentData?.data?.documentData) {
        const binaryData = base64ToUint8Array(documentData?.data?.documentData as any);
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

  useEffect(() => {
    if (!isAuthenticated) return;

    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) return;

    const socket = io(import.meta.env.VITE_SOCKET_API_URL, {
      query: { token: accessToken },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => console.log("🔌 WS connected"));
    socket.on("disconnect", (reason) => console.log("⚠️ WS disconnected:", reason));

    socket.on("documentUpdated", (data: { userUuid: string; updateData: string }) => {
      try {
        const binary = base64ToUint8Array(data.updateData);
        doc.transact(() => Y.applyUpdate(doc, binary), "remote");
        console.log("📥 Applied remote update");
        onDocumentUpdate?.(binary);
      } catch (error) {
        console.error("❌ Failed to apply remote update:", error);
      }
    });

    // const updateHandler = (update: Uint8Array, origin: any) => {
    //   if (origin === "remote") return;
    //   sendUpdate(update);
    // };
    // doc.on("update", updateHandler);

    return () => {
      // doc.off("update", updateHandler);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [doc, isAuthenticated, onDocumentUpdate]);

  const sendUpdate = (update: Uint8Array) => {
    if (!socketRef.current || !socketRef.current.connected) return;

    try {
      socketRef.current.emit("updateDocument", { updateData: update });
      console.log("📤 Sent update to server", update);
    } catch (error) {
      console.error("❌ Failed to send update:", error);
    }
  };

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected || false,
    sendUpdate, // ✅ <-- return this so it can be used manually
  };
}
