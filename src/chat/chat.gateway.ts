import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface User {
  id: string;
  username: string;
  room: string;
}

interface Message {
  room: string;
  username: string;
  message: string;
}

let users: User[] = [];
const messages: Message[] = [];

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    const user = users.find((user) => user.id === client.id);
    if (user) {
      users = users.filter((user) => user.id !== client.id);
      this.server
        .to(user.room)
        .emit('userLeft', `${user.username} has left the room`);
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    client: Socket,
    payload: { username: string; room: string },
  ): void {
    const userExists = users.find(
      (user) =>
        user.username === payload.username && user.room === payload.room,
    );
    if (userExists) {
      client.emit('usernameTaken', 'Username is taken in this room');
      return;
    }

    const user: User = {
      id: client.id,
      username: payload.username,
      room: payload.room,
    };
    users.push(user);
    client.join(payload.room);
    client.emit(
      'joinedRoom',
      `Welcome to room ${payload.room}, ${payload.username}`,
    );
    client.emit(
      'messageHistory',
      messages.filter((msg) => msg.room === payload.room),
    );

    // Broadcast to the room that a new user has joined, except for the joining user
    client.broadcast
      .to(payload.room)
      .emit('userJoined', `${payload.username} has joined the room`);
    console.log(`${payload.username} has joined ${payload.room} room`);
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: { message: string }): void {
    const user = users.find((user) => user.id === client.id);
    if (user) {
      const message: Message = {
        room: user.room,
        username: user.username,
        message: payload.message,
      };
      messages.push(message);
      this.server.to(user.room).emit('newMessage', message);
    }
  }
}
