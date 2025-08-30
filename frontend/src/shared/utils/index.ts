export function bufferToBase64(bufferObj: { type: string; data: number[] }) {
    const uint8 = new Uint8Array(bufferObj.data);
    const chunkSize = 0x8000; // 32KB
    let binary = '';
    for (let i = 0; i < uint8.length; i += chunkSize) {
        const chunk = uint8.subarray(i, i + chunkSize);
        binary += String.fromCharCode(...chunk);
    }
    return btoa(binary);
}

export function uint8ArrayToBase64(bytes: Uint8Array): string {
    let binary = '';
    const chunkSize = 0x8000; // 32KB
    for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        binary += String.fromCharCode(...chunk);
    }
    return btoa(binary);
}

export function base64ToUint8Array(base64: string): Uint8Array {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    const chunkSize = 0x8000; // 32KB
    for (let i = 0; i < len; i += chunkSize) {
        const chunk = binary.slice(i, i + chunkSize);
        for (let j = 0; j < chunk.length; j++) {
            bytes[i + j] = chunk.charCodeAt(j);
        }
    }
    return bytes;
}
