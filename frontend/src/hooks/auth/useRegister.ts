import { authAPI } from "@palatine_whiteboard_frontend/api/endpoints";
import type { RegisterData } from "@palatine_whiteboard_frontend/api/types";
import { toast } from "@palatine_whiteboard_frontend/shared/utils/toast";
import { useMutation } from "@tanstack/react-query";

export const useRegister = () => {
    return useMutation({
        mutationFn: (data: RegisterData) => authAPI.register(data),
        onSuccess: () => {
            toast.success('Registration successful! Please login.');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Registration failed');
        },
    });
};