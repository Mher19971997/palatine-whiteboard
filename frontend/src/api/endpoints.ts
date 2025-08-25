import { apiClient } from './client';

export interface RegisterData {
    email: string;
    password: string;
    phone: string;
    firstName?: string;
    lastName?: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    refresh_token: string;
}

export interface GenerateImageData {
    prompt: string;
}

export interface ImageResponse {
    imageUrl: string;
    prompt: string;
    generatedAt: string;
}

export interface DocumentData {
    documentData: string; // base64 encoded Y.js document
    version: number;
}

export interface DocumentResponse {
    uuid: string;
    userUuid: string;
    documentData: string;
    version: number;
    updatedAt: string;
}

// Auth API
export const authAPI = {
    register: (data: RegisterData) =>
        apiClient.post<any>('/auth/register', data),

    login: (data: LoginData) =>
        apiClient.post<LoginResponse>('/auth/login', data),
};

export const userAPI = {
    getProfile: () =>
        apiClient.get<any>('/user/profile'),
};




// Image API
export const imageAPI = {
    generate: (data: GenerateImageData) =>
        apiClient.post<ImageResponse>('/image/generate', data),
};

// Document API
export const documentAPI = {
    get: (userUuid: string) =>
        apiClient.get<DocumentResponse>(`/document`),

    findAll: () =>
        apiClient.get<DocumentResponse>(`/document`),

    create: (data: DocumentData & { userId: string }) =>
        apiClient.post<DocumentResponse>('/document', data),

    update: (data: { updateData: string; version: number }) =>
        apiClient.put<DocumentResponse>(`/document`, data),
};