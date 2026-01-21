# WebSocket Patterns

Best practices and patterns for real-time, bidirectional communication using WebSockets and Socket.io.

---

## Connection Management

### Server-Side Connection
```typescript
import { Server as SocketIOServer } from 'socket.io';

const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', (reason) => {
    console.log('Client disconnected:', socket.id, reason);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', socket.id, error);
  });
});
```

### Client-Side Connection
```typescript
import { io, Socket } from 'socket.io-client';

const socket: Socket = io('http://localhost:3001', {
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
  timeout: 20000,
});

socket.on('connect', () => {
  console.log('Connected:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
  if (reason === 'io server disconnect') {
    // Server disconnected, manual reconnect needed
    socket.connect();
  }
});

socket.on('reconnect', (attemptNumber) => {
  console.log('Reconnected after', attemptNumber, 'attempts');
});

socket.on('reconnect_error', (error) => {
  console.error('Reconnection error:', error);
});
```

---

## Authentication

### Token-Based Authentication
```typescript
// Server
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
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  const user = socket.data.user;
  console.log('Authenticated user:', user.id);

  // Join user-specific room
  socket.join(`user:${user.id}`);
});

// Client
const socket = io('http://localhost:3001', {
  auth: {
    token: localStorage.getItem('authToken'),
  },
});
```

---

## Rooms & Namespaces

### Rooms (Dynamic Groups)
```typescript
// Server: Join/leave rooms
socket.on('join-room', (roomId: string) => {
  socket.join(roomId);
  socket.to(roomId).emit('user-joined', {
    userId: socket.id,
    timestamp: Date.now(),
  });
});

socket.on('leave-room', (roomId: string) => {
  socket.leave(roomId);
  socket.to(roomId).emit('user-left', {
    userId: socket.id,
    timestamp: Date.now(),
  });
});

// Emit to specific room
io.to('room-123').emit('message', data);

// Emit to multiple rooms
io.to(['room-1', 'room-2']).emit('broadcast', data);

// Emit to everyone except sender
socket.to('room-123').emit('message', data);
```

### Namespaces (Separate Channels)
```typescript
// Server
const chatNamespace = io.of('/chat');
const notificationNamespace = io.of('/notifications');

chatNamespace.on('connection', (socket) => {
  console.log('Connected to /chat');
});

notificationNamespace.on('connection', (socket) => {
  console.log('Connected to /notifications');
});

// Client
const chatSocket = io('http://localhost:3001/chat');
const notifSocket = io('http://localhost:3001/notifications');
```

---

## Event Patterns

### Request-Response Pattern
```typescript
// Server: Acknowledge receipt
socket.on('send-message', (message, callback) => {
  // Validate message
  if (!message.text) {
    return callback({ error: 'Message text required' });
  }

  // Save to database
  const saved = await saveMessage(message);

  // Acknowledge success
  callback({ success: true, messageId: saved.id });

  // Broadcast to others
  socket.to(message.roomId).emit('new-message', saved);
});

// Client: Wait for acknowledgement
socket.emit('send-message', message, (response) => {
  if (response.error) {
    console.error('Failed to send:', response.error);
    // Retry or show error
  } else {
    console.log('Message sent:', response.messageId);
  }
});
```

### Broadcast Pattern
```typescript
// Server: Broadcast to all clients
io.emit('announcement', { message: 'Server maintenance in 5 minutes' });

// Server: Broadcast to all except sender
socket.broadcast.emit('user-typing', { userId: socket.id });

// Server: Broadcast to room
io.to('room-123').emit('message', data);
```

### Private Message Pattern
```typescript
// Server: Direct message between users
socket.on('private-message', ({ toUserId, message }) => {
  io.to(`user:${toUserId}`).emit('private-message', {
    fromUserId: socket.data.user.id,
    message,
    timestamp: Date.now(),
  });
});
```

---

## Presence Detection

### Online/Offline Status
```typescript
// Server
const onlineUsers = new Map<string, string>(); // socketId -> userId

io.on('connection', (socket) => {
  socket.on('user-online', (userId: string) => {
    onlineUsers.set(socket.id, userId);

    // Broadcast updated list
    io.emit('online-users', Array.from(onlineUsers.values()));
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(socket.id);
    io.emit('online-users', Array.from(onlineUsers.values()));
  });
});

// Client
const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

useEffect(() => {
  socket.emit('user-online', currentUserId);

  socket.on('online-users', (users) => {
    setOnlineUsers(users);
  });

  return () => {
    socket.off('online-users');
  };
}, []);
```

### Typing Indicators
```typescript
// Server
socket.on('typing-start', ({ roomId, username }) => {
  socket.to(roomId).emit('user-typing', {
    userId: socket.id,
    username,
  });
});

socket.on('typing-stop', ({ roomId }) => {
  socket.to(roomId).emit('user-stopped-typing', {
    userId: socket.id,
  });
});

// Client with debounce
const [typingUsers, setTypingUsers] = useState<string[]>([]);
const typingTimeouts = useRef(new Map<string, NodeJS.Timeout>());

socket.on('user-typing', ({ userId, username }) => {
  setTypingUsers(prev => [...new Set([...prev, username])]);

  // Clear after 3 seconds
  const existing = typingTimeouts.current.get(userId);
  if (existing) clearTimeout(existing);

  const timeout = setTimeout(() => {
    setTypingUsers(prev => prev.filter(u => u !== username));
    typingTimeouts.current.delete(userId);
  }, 3000);

  typingTimeouts.current.set(userId, timeout);
});
```

---

## Reconnection Handling

### Client-Side Reconnection
```typescript
const [isConnected, setIsConnected] = useState(false);
const [reconnectAttempt, setReconnectAttempt] = useState(0);

useEffect(() => {
  socket.on('connect', () => {
    setIsConnected(true);
    setReconnectAttempt(0);

    // Rejoin rooms after reconnection
    socket.emit('rejoin-rooms', previousRooms);

    // Refresh data that might have changed
    fetchMissedMessages();
  });

  socket.on('disconnect', () => {
    setIsConnected(false);
  });

  socket.on('reconnect_attempt', (attemptNumber) => {
    setReconnectAttempt(attemptNumber);
  });

  socket.on('reconnect_failed', () => {
    // Show persistent offline message
    showError('Unable to connect. Please refresh the page.');
  });

  return () => {
    socket.off('connect');
    socket.off('disconnect');
    socket.off('reconnect_attempt');
    socket.off('reconnect_failed');
  };
}, []);
```

### Message Queuing
```typescript
// Client: Queue messages when offline
const messageQueue = useRef<Message[]>([]);

const sendMessage = (message: Message) => {
  if (!isConnected) {
    messageQueue.current.push(message);
    return;
  }

  socket.emit('send-message', message, (response) => {
    if (!response.success) {
      messageQueue.current.push(message);
    }
  });
};

// Flush queue when reconnected
useEffect(() => {
  if (isConnected && messageQueue.current.length > 0) {
    const queue = [...messageQueue.current];
    messageQueue.current = [];

    queue.forEach(message => {
      socket.emit('send-message', message);
    });
  }
}, [isConnected]);
```

---

## Scaling with Redis

### Multi-Server Setup
```typescript
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient({ url: 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

await pubClient.connect();
await subClient.connect();

io.adapter(createAdapter(pubClient, subClient));

// Now events are shared across all server instances
io.emit('announcement', 'Shared across all servers');
```

### Redis Pub/Sub for Cross-Server Events
```typescript
// Server 1
io.emit('user-action', { userId, action: 'login' });

// Server 2 (different instance) receives the same event
io.on('connection', (socket) => {
  // Will receive events from all servers
});
```

---

## Performance Optimization

### Event Batching
```typescript
// Server: Batch multiple events
const updates: Update[] = [];

setInterval(() => {
  if (updates.length > 0) {
    io.emit('batch-updates', updates);
    updates.length = 0;
  }
}, 100); // Batch every 100ms

socket.on('update', (data) => {
  updates.push(data);
});
```

### Compression
```typescript
const io = new SocketIOServer(server, {
  perMessageDeflate: {
    threshold: 1024, // Only compress messages > 1KB
  },
});
```

### Binary Data
```typescript
// Server: Send binary data
socket.emit('image', Buffer.from(imageData));

// Client: Receive binary data
socket.on('image', (buffer: ArrayBuffer) => {
  const blob = new Blob([buffer], { type: 'image/png' });
  const url = URL.createObjectURL(blob);
});
```

---

## Error Handling

### Server-Side
```typescript
io.on('connection', (socket) => {
  socket.on('error', (error) => {
    console.error('Socket error:', socket.id, error);
    socket.emit('error', {
      code: 'SOCKET_ERROR',
      message: 'An error occurred',
    });
  });

  socket.on('*', (event, ...args) => {
    try {
      // Handle event
    } catch (error) {
      socket.emit('error', {
        code: 'PROCESSING_ERROR',
        message: error.message,
      });
    }
  });
});
```

### Client-Side
```typescript
socket.on('connect_error', (error) => {
  if (error.message === 'Authentication error') {
    // Redirect to login
    window.location.href = '/login';
  } else {
    console.error('Connection error:', error);
  }
});

socket.on('error', (error) => {
  showNotification(error.message, 'error');
});
```

---

## Testing

### Unit Testing Socket Events
```typescript
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { io as Client } from 'socket.io-client';

describe('Chat', () => {
  let io: SocketIOServer;
  let clientSocket: Socket;

  beforeAll((done) => {
    const httpServer = createServer();
    io = new SocketIOServer(httpServer);
    httpServer.listen(() => {
      const port = (httpServer.address() as any).port;
      clientSocket = Client(`http://localhost:${port}`);
      clientSocket.on('connect', done);
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
  });

  test('should send and receive messages', (done) => {
    clientSocket.emit('message', 'Hello');

    clientSocket.on('message-received', (msg) => {
      expect(msg).toBe('Hello');
      done();
    });
  });
});
```

---

## Best Practices

### DO
- ✅ Authenticate connections
- ✅ Use rooms for targeted messaging
- ✅ Handle reconnections gracefully
- ✅ Implement message acknowledgements
- ✅ Use Redis adapter for scaling
- ✅ Validate all incoming messages
- ✅ Rate limit per client
- ✅ Clean up event listeners

### DON'T
- ❌ Trust client data without validation
- ❌ Broadcast to all clients unnecessarily
- ❌ Send large payloads (use pagination)
- ❌ Forget to remove event listeners
- ❌ Use Socket.io for file uploads
- ❌ Send sensitive data without encryption
- ❌ Allow unlimited connection attempts
