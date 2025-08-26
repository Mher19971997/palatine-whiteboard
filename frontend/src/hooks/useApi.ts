import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authAPI, imageAPI, documentAPI } from '../api/endpoints';
import type { LoginData, RegisterData, GenerateImageData, DocumentData } from '../api/endpoints';
import { toast } from '../utils/toast';

// Auth hooks
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

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: RegisterData) => authAPI.register(data),
    onSuccess: () => {
      toast.success('Registration successful! Please login.');
    },
    onError: (error: any) => {
      console.log(error, 54645644656);

      toast.error(error.response?.data?.message || 'Registration failed');
    },
  });
};

// Image hooks
export const useGenerateImage = () => {
  return useMutation({
    mutationFn: (data: GenerateImageData) => imageAPI.generate(data),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Image generation failed');
    },
  });
};

// Document hooks
export const useDocument = () => {
  return useQuery({
    queryKey: ['document'],
    queryFn: () => documentAPI.get(),
    retry: 1,
  });
};

export const useDocumentFindAll = () => {
  return useQuery({
    queryKey: ['documents'],
    queryFn: () => documentAPI.findAll(),
    retry: 1,
  });
};



export const useCreateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DocumentData & { userId: string }) => documentAPI.create(data),
    onSuccess: (response, variables) => {
      queryClient.setQueryData(['document', variables.userId], response.data);
      toast.success('Document created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create document');
    },
  });
};

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