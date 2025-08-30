import { apiClient } from '@palatine_whiteboard_frontend/api';
import type { GenerateImageData, ImageResponse } from '@palatine_whiteboard_frontend/api/types';


export const imageAPI = {
    generate: (data: GenerateImageData) =>
        apiClient.post<ImageResponse>('/image/generate', data),
};

