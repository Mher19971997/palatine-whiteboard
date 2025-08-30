export interface User {
  id: string;
  name?: string;
}

export interface DocumentData {
  documentData: string;
  version: number;
}

export interface ImageGenerationRequest {
  prompt: string;
  userId: string;
}

export interface ImageGenerationResponse {
  imageUrl: string;
  prompt: string;
  generatedAt: string;
}

export interface WebSocketMessage {
  type: 'document-update' | 'document-state' | 'join-document';
  data: any;
}