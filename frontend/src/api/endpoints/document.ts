import { apiClient } from '@palatine_whiteboard_frontend/api';
import type { DocumentResponse, DocumentData } from '@palatine_whiteboard_frontend/api/types';

export const documentAPI = {
    get: () =>
        apiClient.get<DocumentResponse>(`/document`),

    findAll: () =>
        apiClient.get<DocumentResponse>(`/document`),

    create: (data: DocumentData) =>
        apiClient.post<DocumentResponse>('/document', data),

    update: (data: { updateData: string; version: number }) =>
        apiClient.put<DocumentResponse>(`/document`, data),
};