import React, { useState } from 'react';
import { useImageGeneration } from '../hooks/useImageGeneration';
import { LoadingSpinner } from './LoadingSpinner';

interface ImageGenerationWidgetProps {
    userId: string;
    onImageGenerated: (imageUrl: string) => void;
}

export const ImageGenerationWidget: React.FC<ImageGenerationWidgetProps> = ({
    userId,
    onImageGenerated,
}) => {
    const [prompt, setPrompt] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const { generateImage, isLoading, error } = useImageGeneration(userId);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        const result = await generateImage(prompt);
        if (result) {
            onImageGenerated(result.imageUrl);
            setPrompt('');
            setIsVisible(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleGenerate();
        }
    };

    return (
        <div className="fixed top-4 right-4 z-50">
            {/* Toggle Button */}
            <button
                onClick={() => setIsVisible(!isVisible)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 flex items-center gap-2"
                disabled={isLoading}
            >
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                </svg>
                Generate Image
            </button>

            {/* Widget Panel */}
            {isVisible && (
                <div className="absolute top-12 right-0 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 w-80">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-800">Generate Image</h3>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {error && (
                        <div className="mb-3 p-2 bg-red-100 border border-red-300 text-red-700 rounded text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-3">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Describe the image you want to generate..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={3}
                            disabled={isLoading}
                        />

                        <div className="flex gap-2">
                            <button
                                onClick={handleGenerate}
                                disabled={!prompt.trim() || isLoading}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-2 px-4 rounded-md transition-colors duration-200 font-medium"
                            >
                                {isLoading ? 'Generating...' : 'Generate'}
                            </button>
                        </div>

                        {isLoading && (
                            <div className="flex justify-center">
                                <LoadingSpinner size="small" message="Creating your image..." />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};