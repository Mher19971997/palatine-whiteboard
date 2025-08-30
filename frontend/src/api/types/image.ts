import type { CommonEntity } from "@palatine_whiteboard_frontend/shared/entity/common-entity";

export interface GenerateImageData {
    prompt: string;
}

export interface ImageResponse extends CommonEntity {
    imageUrl: string;
    prompt: string;
    generatedAt: string;
}

