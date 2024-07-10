"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
let users = [];
const messages = [];
let ChatGateway = class ChatGateway {
    handleConnection(client) {
        console.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        console.log(`Client disconnected: ${client.id}`);
        const user = users.find((user) => user.id === client.id);
        if (user) {
            users = users.filter((user) => user.id !== client.id);
            this.server
                .to(user.room)
                .emit('userLeft', `${user.username} has left the room`);
        }
    }
    handleJoinRoom(client, payload) {
        const userExists = users.find((user) => user.username === payload.username && user.room === payload.room);
        if (userExists) {
            client.emit('usernameTaken', 'Username is taken in this room');
            return;
        }
        const user = {
            id: client.id,
            username: payload.username,
            room: payload.room,
        };
        users.push(user);
        client.join(payload.room);
        client.emit('joinedRoom', `Welcome to room ${payload.room}, ${payload.username}`);
        client.emit('messageHistory', messages.filter((msg) => msg.room === payload.room));
        client.broadcast
            .to(payload.room)
            .emit('userJoined', `${payload.username} has joined the room`);
        console.log(`${payload.username} has joined ${payload.room} room`);
    }
    handleMessage(client, payload) {
        const user = users.find((user) => user.id === client.id);
        if (user) {
            const message = {
                room: user.room,
                username: user.username,
                message: payload.message,
            };
            messages.push(message);
            this.server.to(user.room).emit('newMessage', message);
        }
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinRoom'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('message'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleMessage", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)()
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map