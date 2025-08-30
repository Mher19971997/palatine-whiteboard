// document.gateway.ts - исправленная версия
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
import { JwtService } from '@nestjs/jwt';
import { BearerUser } from '../user/dto/output';
import { AuthService } from '../auth/auth.service';

interface UpdateMessage {
  updateData: any; // Base64
}

interface ClientData {
  user: BearerUser;
  rooms: Set<string>;
}

@WebSocketGateway({ 
  cors: { origin: '*' },
  transports: ['websocket'],
  path: '/socket.io/',
})
export class DocumentGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly connectedClients = new Map<string, Socket>();

  constructor(
    private readonly documentService: DocumentService,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.query.token as string;
    
    try {
      const user = await this.authService.validateUser(token);
      
      const clientData: ClientData = {
        user,
        rooms: new Set(),
      };
      
      client.data = clientData;
      
      // Подключаем к персональной комнате пользователя
      const userRoom = `user:${user.uuid}`;
      client.join(userRoom);
      clientData.rooms.add(userRoom);
   // Сохраняем ссылку на клиента
      this.connectedClients.set(client.id, client);
      
      console.log(`WS connected: ${user.uuid} (${client.id})`);
      
      // Отправляем подтверждение подключения
      client.emit('connected', { 
        userUuid: user.uuid,
        message: 'Successfully connected to document sync'
      });
      
    } catch (err) {
      console.log('WS connection rejected: invalid token', err.message);
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const clientData = client.data as ClientData;
    if (clientData?.user) {
      console.log(`WS disconnected: ${clientData.user.uuid} (${client.id})`);
      
      // Выходим из всех комнат
      clientData.rooms.forEach(room => {
        client.leave(room);
      });
    }
    
    // Удаляем из карты подключенных клиентов
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('updateDocument')
  async handleUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: UpdateMessage,
  ) {
    const clientData = client.data as ClientData;
    if (!clientData?.user) {
      client.emit('error', { message: 'User not authenticated' });
      return;
    }

    const user = clientData.user;
    console.log(user,777777777777);
    
    try {
      // Валидация данных
      // if (!data.updateData || typeof data.updateData !== 'string') {
      //   client.emit('error', { message: 'Invalid update data format' });
      //   return;
      // }

      // const buffer = Buffer.from(data.updateData, 'base64');

      // 1️⃣ Сохраняем в Redis (асинхронно)
      console.log(data,"datadatadata");
      
      await this.documentService.updateDocument({userUuid: user.uuid, authorization: ''}, {updateData: data.updateData})

      // 2️⃣ Рассылаем ВСЕМ клиентам этого пользователя (включая отправителя)
      // Это важно для синхронизации между вкладками
      const userRoom = `user:${user.uuid}`;
      client.to(userRoom).emit('documentUpdated', {
        userUuid: user.uuid,
        updateData: data.updateData,
        timestamp: Date.now(),
        source: client.id,
      });

      // 3️⃣ Подтверждаем получение
      client.emit('updateAcknowledged', {
        timestamp: Date.now(),
        success: true,
      });

      console.log(`Document update processed for user: ${user.uuid}`);

    } catch (error) {
      console.error(`Error processing document update:`, error);
      client.emit('error', {
        message: 'Failed to process document update',
        error: error.message,
      });
    }
  }

  @SubscribeMessage('joinDocumentRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { documentId: string },
  ) {
    const clientData = client.data as ClientData;
    if (!clientData?.user) return;

    const roomName = `doc:${data.documentId}`;
    client.join(roomName);
    clientData.rooms.add(roomName);
    
    console.log(`User ${clientData.user.uuid} joined room ${roomName}`);
    
    client.emit('roomJoined', { 
      documentId: data.documentId,
      room: roomName 
    });
  }

  @SubscribeMessage('leaveDocumentRoom')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { documentId: string },
  ) {
    const clientData = client.data as ClientData;
    if (!clientData?.user) return;

    const roomName = `doc:${data.documentId}`;
    client.leave(roomName);
    clientData.rooms.delete(roomName);
    
    console.log(`User ${clientData.user.uuid} left room ${roomName}`);
    
    client.emit('roomLeft', { 
      documentId: data.documentId,
      room: roomName 
    });
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { timestamp: Date.now() });
  }

  // Метод для отправки обновления конкретному пользователю
  async sendUpdateToUser(userUuid: string, updateData: string) {
    const userRoom = `user:${userUuid}`;
    this.connectedClients.forEach(client => {
      const clientData = client.data as ClientData;
      if (clientData?.user?.userUuid === userUuid) {
        client.emit('documentUpdated', {
          userUuid,
          updateData,
          timestamp: Date.now(),
          source: 'server',
        });
      }
    });
  }

  // Получение статистики подключений
  getConnectionStats() {
    const stats = {
      totalConnections: this.connectedClients.size,
      userConnections: new Map<string, number>(),
    };

    this.connectedClients.forEach(client => {
      const clientData = client.data as ClientData;
      if (clientData?.user) {
        const userUuid = clientData.user.uuid;
        const current = stats.userConnections.get(userUuid) || 0;
        stats.userConnections.set(userUuid, current + 1);
      }
    });

    return stats;
  }
}