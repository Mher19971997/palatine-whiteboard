import { documentAPI } from '@palatine_whiteboard_frontend/api/endpoints';
import { toast } from '@palatine_whiteboard_frontend/shared/utils/toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useUpdateDocument = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ data }: { data: { updateData: string; version: number } }) =>
            documentAPI.update(data?.updateData?.data),
        onSuccess: (response, variables) => {
            queryClient.setQueryData(['document', variables], response.data);
        },
        onError: (error: any) => {
            console.error('Failed to update document:', error);
            toast.error(error.response?.data?.message || 'Failed to update document');
        },
    });
};