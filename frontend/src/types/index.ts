export interface User {
  id: string;
  name?: string;
}

export interface DocumentData {
  id: number;
  userId: string;
  documentData: string;
  version: number;
  updatedAt: string;
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