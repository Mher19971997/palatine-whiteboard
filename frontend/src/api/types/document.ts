import type { CommonEntity } from "@palatine_whiteboard_frontend/shared/entity/common-entity";

export interface DocumentData {
    documentData: { type: string; data: number[] };
    version: number;
}

export interface DocumentResponse extends CommonEntity {
    uuid: string;
    userUuid: string;
    documentData: { type: string; data: number[] };
    version: number;
}

