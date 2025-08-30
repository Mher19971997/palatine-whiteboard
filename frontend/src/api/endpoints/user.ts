import { apiClient } from '@palatine_whiteboard_frontend/api';

export const userAPI = {
    getProfile: () =>
        apiClient.get<any>('/user/profile'),
};