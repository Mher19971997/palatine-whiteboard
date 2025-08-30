import { apiClient } from '@palatine_whiteboard_frontend/api';
import type { RegisterData, LoginData, LoginResponse } from '@palatine_whiteboard_frontend/api/types';

export const authAPI = {
    register: (data: RegisterData) =>
        apiClient.post<any>('/auth/register', data),

    login: (data: LoginData) =>
        apiClient.post<LoginResponse>('/auth/login', data),
};