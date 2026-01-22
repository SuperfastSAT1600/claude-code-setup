---
name: websocket-specialist
description: Implement real-time communication with WebSockets for bidirectional data flow
model: sonnet
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
when_to_use:
  - Implementing real-time chat or messaging
  - Building collaborative editing features
  - Creating live dashboards with real-time updates
  - Implementing presence detection (online/offline status)
  - Setting up Socket.io with rooms and namespaces
  - Handling WebSocket reconnection and error recovery
---

# WebSocket Specialist Agent

Implement WebSocket connections for real-time, bidirectional communication between clients and servers.

---

## Purpose

Enable real-time features like chat, live updates, notifications, collaborative editing, and multiplayer games using WebSocket protocol.

---

## When to Use

- Real-time chat applications
- Live notifications
- Collaborative editing (Google Docs-style)
- Live dashboards and monitoring
- Multiplayer games
- Stock tickers / live data feeds

---

## Capabilities

### WebSocket Implementation
- Socket.io server setup
- Native WebSocket API
- Connection management
- Authentication
- Room/namespace management

### Real-Time Patterns
- Pub/sub messaging
- Broadcast to all clients
- Direct messaging
- Room-based communication
- Presence detection

### Production Concerns
- Reconnection handling
- Message queuing
- Load balancing
- Scaling with Redis adapter
- Heartbeat/ping-pong

---

## Setup with Socket.io

### Server (Next.js Custom Server)
```typescript
// server.ts
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { parse } from 'url';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true,
    },
  });

  // Socket.io logic
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  server.listen(3001, () => {
    console.log('> Ready on http://localhost:3001');
  });
});
```

### Client (React)
```typescript
'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket;

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize socket
    socket = io('http://localhost:3001', {
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('Connected:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected');
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return { socket, isConnected };
}
```

---

## Real-Time Chat Example

### Server
```typescript
// server.ts
import { Server as SocketIOServer } from 'socket.io';

interface Message {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: number;
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins a room
  socket.on('join-room', (roomId: string) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);

    // Notify others in the room
    socket.to(roomId).emit('user-joined', {
      userId: socket.id,
      timestamp: Date.now(),
    });
  });

  // User sends a message
  socket.on('send-message', (data: { roomId: string; message: Message }) => {
    // Broadcast to all clients in the room
    io.to(data.roomId).emit('new-message', data.message);
  });

  // User is typing
  socket.on('typing', (data: { roomId: string; username: string }) => {
    socket.to(data.roomId).emit('user-typing', {
      userId: socket.id,
      username: data.username,
    });
  });

  // User leaves room
  socket.on('leave-room', (roomId: string) => {
    socket.leave(roomId);
    socket.to(roomId).emit('user-left', {
      userId: socket.id,
      timestamp: Date.now(),
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});
```

### Client Component
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';

interface Message {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: number;
}

export function ChatRoom({ roomId }: { roomId: string }) {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!socket) return;

    // Join room
    socket.emit('join-room', roomId);

    // Listen for new messages
    socket.on('new-message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Listen for typing indicators
    socket.on('user-typing', (data: { userId: string; username: string }) => {
      setTypingUsers((prev) => [...prev, data.username]);
      setTimeout(() => {
        setTypingUsers((prev) => prev.filter((u) => u !== data.username));
      }, 3000);
    });

    // Listen for user join/leave
    socket.on('user-joined', (data) => {
      console.log('User joined:', data);
    });

    socket.on('user-left', (data) => {
      console.log('User left:', data);
    });

    return () => {
      socket.emit('leave-room', roomId);
      socket.off('new-message');
      socket.off('user-typing');
      socket.off('user-joined');
      socket.off('user-left');
    };
  }, [socket, roomId]);

  const sendMessage = () => {
    if (!inputMessage.trim() || !socket) return;

    const message: Message = {
      id: Date.now().toString(),
      userId: socket.id,
      username: 'CurrentUser', // Get from auth context
      text: inputMessage,
      timestamp: Date.now(),
    };

    socket.emit('send-message', { roomId, message });
    setInputMessage('');
  };

  const handleTyping = () => {
    if (!socket) return;
    socket.emit('typing', { roomId, username: 'CurrentUser' });
  };

  if (!isConnected) {
    return <div>Connecting...</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg) => (
          <div key={msg.id} className="mb-2">
            <strong>{msg.username}:</strong> {msg.text}
          </div>
        ))}
      </div>

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="px-4 text-sm text-gray-500">
          {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => {
              setInputMessage(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 px-4 py-2 border rounded"
            placeholder="Type a message..."
          />
          <button
            onClick={sendMessage}
            className="px-6 py-2 bg-blue-500 text-white rounded"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## Authentication with Socket.io

### Server-side Authentication
```typescript
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';

io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    socket.data.user = decoded;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  const user = socket.data.user;
  console.log('Authenticated user connected:', user.id);

  // User-specific logic
  socket.join(`user:${user.id}`);
});
```

### Client-side
```typescript
const socket = io('http://localhost:3001', {
  auth: {
    token: localStorage.getItem('authToken'),
  },
});
```

---

## Rooms and Namespaces

### Rooms (Groups within Namespace)
```typescript
// Server
socket.on('join-room', (roomId: string) => {
  socket.join(roomId);
});

// Emit to everyone in room
io.to(roomId).emit('event', data);

// Emit to everyone in room except sender
socket.to(roomId).emit('event', data);

// Emit to multiple rooms
io.to(['room1', 'room2']).emit('event', data);
```

### Namespaces (Separate Communication Channels)
```typescript
// Server
const chatNamespace = io.of('/chat');
const notificationNamespace = io.of('/notifications');

chatNamespace.on('connection', (socket) => {
  console.log('Connected to /chat namespace');
});

notificationNamespace.on('connection', (socket) => {
  console.log('Connected to /notifications namespace');
});

// Client
const chatSocket = io('http://localhost:3001/chat');
const notifSocket = io('http://localhost:3001/notifications');
```

---

## Reconnection Handling

### Server
```typescript
io.on('connection', (socket) => {
  socket.on('reconnect', (attemptNumber) => {
    console.log('Client reconnected after', attemptNumber, 'attempts');
  });

  socket.on('reconnect_error', (error) => {
    console.log('Reconnection error:', error);
  });
});
```

### Client
```typescript
const socket = io('http://localhost:3001', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});

socket.on('reconnect', (attemptNumber) => {
  console.log('Reconnected after', attemptNumber, 'attempts');
  // Rejoin rooms, refresh data, etc.
});

socket.on('reconnect_failed', () => {
  console.log('Failed to reconnect');
  // Show offline message to user
});
```

---

## Scaling with Redis

### Multiple Server Instances
```typescript
// server.ts
import { Server as SocketIOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient({ url: 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient));

  io.on('connection', (socket) => {
    console.log('Connected:', socket.id);
  });
});
```

### Load Balancer Configuration (nginx)
```nginx
upstream socketio {
    ip_hash; # Sticky sessions
    server localhost:3001;
    server localhost:3002;
    server localhost:3003;
}

server {
    listen 80;

    location /socket.io/ {
        proxy_pass http://socketio;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## Message Queuing

### Reliable Message Delivery
```typescript
// Server: Acknowledge message receipt
socket.on('send-message', (message, callback) => {
  // Process message
  io.to(roomId).emit('new-message', message);

  // Acknowledge
  callback({ success: true });
});

// Client: Wait for acknowledgement
socket.emit('send-message', message, (response) => {
  if (response.success) {
    console.log('Message delivered');
  } else {
    // Retry or show error
  }
});
```

---

## Presence Detection

```typescript
// Server
const onlineUsers = new Map<string, string>(); // socketId -> userId

io.on('connection', (socket) => {
  socket.on('user-online', (userId: string) => {
    onlineUsers.set(socket.id, userId);

    // Broadcast updated online users list
    io.emit('online-users', Array.from(onlineUsers.values()));
  });

  socket.on('disconnect', () => {
    const userId = onlineUsers.get(socket.id);
    onlineUsers.delete(socket.id);

    io.emit('online-users', Array.from(onlineUsers.values()));
  });
});

// Client
const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

useEffect(() => {
  socket.emit('user-online', currentUserId);

  socket.on('online-users', (users: string[]) => {
    setOnlineUsers(users);
  });
}, [socket]);
```

---

## Best Practices

### DO
- ✅ Authenticate connections
- ✅ Use rooms for targeted messaging
- ✅ Handle reconnections gracefully
- ✅ Implement heartbeat/ping-pong
- ✅ Use Redis adapter for scaling
- ✅ Validate all incoming messages
- ✅ Rate limit events per client

### DON'T
- ❌ Send sensitive data without encryption
- ❌ Trust client-side data
- ❌ Broadcast to all clients unnecessarily
- ❌ Forget to clean up event listeners
- ❌ Send large payloads (compress or paginate)
- ❌ Use Socket.io for file uploads

---

## Debugging

```typescript
// Server: Enable debug mode
const io = new SocketIOServer(server, {
  cors: { origin: '*' },
  transports: ['websocket', 'polling'],
});

// Track all events
io.on('connection', (socket) => {
  console.log('Connected:', socket.id);

  socket.onAny((eventName, ...args) => {
    console.log('Event:', eventName, 'Args:', args);
  });
});

// Client: Enable debug mode
localStorage.debug = 'socket.io-client:*';
```

---

## WebSocket vs Polling vs SSE

| Feature | WebSocket | Long Polling | Server-Sent Events |
|---------|-----------|--------------|---------------------|
| Direction | Bidirectional | Client→Server | Server→Client |
| Real-time | Yes | Limited | Yes |
| Overhead | Low | High | Low |
| Browser Support | Modern | All | Modern |
| Use Case | Chat, games | Legacy support | Live feeds, notifications |

---

## Tools

- **Socket.io**: Full-featured WebSocket library
- **ws**: Lightweight WebSocket library
- **Pusher**: Managed WebSocket service
- **Ably**: Real-time messaging platform
- **Redis**: Message broker for scaling

---

## Resources

- **Skill Reference**: `.claude/skills/websocket-patterns.md`
- **Backend Patterns**: `.claude/skills/backend-patterns.md`
