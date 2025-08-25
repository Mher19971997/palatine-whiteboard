import axios from 'axios';
import type { DocumentData, ImageGenerationRequest, ImageGenerationResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:6001';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export class ApiService {
  // Document API
  static async getDocument(userId: string): Promise<DocumentData | null> {
    try {
      const response = await apiClient.get(`/api/documents/${userId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  static async createDocument(userId: string, documentData: string): Promise<DocumentData> {
    const response = await apiClient.post('/api/documents', {
      userId,
      documentData,
      version: 1,
    });
    return response.data;
  }

  static async updateDocument(
    userId: string,
    updateData: string,
    version: number
  ): Promise<DocumentData> {
    const response = await apiClient.put(`/api/documents/${userId}`, {
      updateData,
      version,
    });
    return response.data;
  }

  // Image Generation API
  static async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const response = await apiClient.post('/api/images/generate', request);
    return response.data;
  }
}