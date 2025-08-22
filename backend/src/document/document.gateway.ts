// src/document/document.gateway.ts
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { DocumentService } from './document.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/documents',
})
export class DocumentGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly documentService: DocumentService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-document')
  async handleJoinDocument(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    const { userId } = data;
    
    // Присоединяем клиента к комнате документа
    await client.join(`doc:${userId}`);
    
    // Отправляем текущее состояние документа
    const document = await this.documentService.getDocument(userId);
    if (document) {
      client.emit('document-state', {
        documentData: document.documentData,
        version: document.version,
      });
    }
  }

  @SubscribeMessage('document-update')
  async handleDocumentUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; update: string },
  ) {
    const { userId, update } = data;

    // Сохраняем изменения
    const updateBuffer = Buffer.from(update, 'base64');
    await this.documentService.saveDocumentUpdate(userId, updateBuffer);

    // Отправляем изменения другим клиентам в той же комнате
    client.to(`doc:${userId}`).emit('document-update', { update });
  }
}