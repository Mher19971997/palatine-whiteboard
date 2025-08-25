// src/image/image.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class ImageService {
  async generateImage(generateDto: any) {
    // Имитация задержки генерации изображения
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Мокированная генерация - возвращаем случайное изображение
    const imageUrl = `https://picsum.photos/400/300?random=${Date.now()}`;

    return {
      imageUrl,
      prompt: generateDto.prompt,
      generatedAt: new Date().toISOString(),
    };
  }
}