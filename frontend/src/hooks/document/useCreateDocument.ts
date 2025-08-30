import { documentAPI } from "@palatine_whiteboard_frontend/api/endpoints";
import { toast } from "@palatine_whiteboard_frontend/shared/utils/toast";
import type { DocumentData } from "@palatine_whiteboard_frontend/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateDocument = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: DocumentData) => documentAPI.create(data),
        onSuccess: (response) => {
            queryClient.setQueryData(['document'], response.data);
            toast.success('Document created successfully!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create document');
        },
    });
};