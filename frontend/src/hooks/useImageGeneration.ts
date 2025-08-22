import { useState } from 'react';
import { ApiService } from '../services/api';
import type { ImageGenerationResponse } from '../types';

export const useImageGeneration = (userId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async (prompt: string): Promise<ImageGenerationResponse | null> => {
    if (!prompt.trim()) {
      setError('Prompt cannot be empty');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await ApiService.generateImage({ prompt, userId });
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to generate image');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateImage,
    isLoading,
    error,
  };
};