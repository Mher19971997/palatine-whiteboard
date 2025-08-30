import { authAPI } from "@palatine_whiteboard_frontend/api/endpoints";
import type { LoginData } from "@palatine_whiteboard_frontend/api/types";
import { toast } from "@palatine_whiteboard_frontend/shared/utils/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginData) => authAPI.login(data),
    onSuccess: (response) => {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Successfully logged in!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });
};