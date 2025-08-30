import { documentAPI } from '@palatine_whiteboard_frontend/api/endpoints';
import { useQuery } from '@tanstack/react-query';

export const useDocumentFindAll = () => {
    return useQuery({
        queryKey: ['documents'],
        queryFn: () => documentAPI.findAll(),
        retry: 1,
    });
};