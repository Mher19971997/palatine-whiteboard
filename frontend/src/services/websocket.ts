import { io, Socket } from 'socket.io-client';

const WEBSOCKET_URL = import.meta.env.VITE_WS_URL || 'http://localhost:6001';

export class WebSocketService {
  private socket: Socket | null = null;
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
    this.connect();
  }

  private connect(): void {
    this.socket = io(`${WEBSOCKET_URL}/documents`, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.joinDocument(this.userId);
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });
  }

  joinDocument(userId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join-document', { userId });
    }
  }

  sendDocumentUpdate(userId: string, update: string): void {
    if (this.socket?.connected) {
      this.socket.emit('document-update', { userId, update });
    }
  }

  onDocumentState(callback: (data: { documentData: string; version: number }) => void): void {
    this.socket?.on('document-state', callback);
  }

  onDocumentUpdate(callback: (data: { update: string }) => void): void {
    this.socket?.on('document-update', callback);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}