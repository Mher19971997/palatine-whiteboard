import { useMutation } from '@tanstack/react-query';
import { imageAPI } from '@palatine_whiteboard_frontend/api/endpoints';
import type { GenerateImageData } from '@palatine_whiteboard_frontend/api/types';
import { toast } from '@palatine_whiteboard_frontend/shared/utils/toast';

export const useGenerateImage = () => {
    return useMutation({
        mutationFn: (data: GenerateImageData) => imageAPI.generate(data),
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Image generation failed');
        },
    });
};