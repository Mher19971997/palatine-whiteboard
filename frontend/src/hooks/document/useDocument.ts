import { documentAPI } from '@palatine_whiteboard_frontend/api/endpoints';
import { useQuery } from '@tanstack/react-query';

export const useDocument = () => {
    return useQuery({
        queryKey: ['document'],
        queryFn: () => documentAPI.get(),
        retry: 1,
    });
};