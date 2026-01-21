# REST API Design Patterns

Reference guide for designing clean, consistent RESTful APIs following industry best practices.

---

## Resource Naming

### Rules
- Use **nouns**, not verbs
- Use **plural** for collections
- Use **kebab-case** for multi-word resources
- Keep URLs **hierarchical** to show relationships

### Examples
```
✅ Good:
GET    /users
GET    /users/123
GET    /users/123/posts
POST   /users
PUT    /users/123
DELETE /users/123

❌ Bad:
GET    /getUsers
GET    /user/123
POST   /createUser
GET    /user-posts/123
```

---

## HTTP Methods

### GET - Retrieve Resources
```
GET /users           → List all users
GET /users/123       → Get specific user
GET /users?page=2    → List with pagination
GET /users?role=admin → List with filtering
```

**Characteristics:**
- Idempotent
- Cacheable
- No request body
- Safe (no side effects)

### POST - Create Resources
```
POST /users
Content-Type: application/json

{
  "name": "Alice",
  "email": "alice@example.com"
}

Response: 201 Created
Location: /users/456
{
  "id": "456",
  "name": "Alice",
  "email": "alice@example.com",
  "createdAt": "2026-01-21T10:00:00Z"
}
```

**Characteristics:**
- Not idempotent
- Creates new resource
- Returns 201 Created
- Includes Location header

### PUT - Replace Resource
```
PUT /users/123
{
  "name": "Alice Smith",
  "email": "alice@example.com"
}

Response: 200 OK (or 204 No Content)
```

**Characteristics:**
- Idempotent
- Replaces entire resource
- Requires full representation

### PATCH - Partial Update
```
PATCH /users/123
{
  "name": "Alice Smith"
}

Response: 200 OK
```

**Characteristics:**
- Partially idempotent
- Updates specific fields only
- More efficient than PUT

### DELETE - Remove Resource
```
DELETE /users/123

Response: 204 No Content (or 200 OK with body)
```

**Characteristics:**
- Idempotent
- Removes resource
- Returns 204 (no content) or 200 (with deletion confirmation)

---

## Status Codes

### Success (2xx)
- **200 OK** - Successful GET, PUT, PATCH, or DELETE with response body
- **201 Created** - Successful POST that creates a resource
- **204 No Content** - Successful request with no response body (DELETE, PUT)

### Client Error (4xx)
- **400 Bad Request** - Invalid request syntax or validation error
- **401 Unauthorized** - Authentication required or failed
- **403 Forbidden** - Authenticated but not authorized
- **404 Not Found** - Resource doesn't exist
- **409 Conflict** - Request conflicts with current state (e.g., duplicate)
- **422 Unprocessable Entity** - Validation error with details
- **429 Too Many Requests** - Rate limit exceeded

### Server Error (5xx)
- **500 Internal Server Error** - Unexpected server error
- **502 Bad Gateway** - Invalid response from upstream server
- **503 Service Unavailable** - Server temporarily unavailable
- **504 Gateway Timeout** - Upstream server timeout

---

## Response Format

### Standard Success Response
```json
{
  "data": {
    "id": "123",
    "name": "Alice",
    "email": "alice@example.com"
  },
  "meta": {
    "timestamp": "2026-01-21T10:00:00Z",
    "version": "1.0"
  }
}
```

### Standard Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address",
        "value": "not-an-email"
      }
    ]
  }
}
```

### List Response with Pagination
```json
{
  "data": [
    { "id": "1", "name": "Alice" },
    { "id": "2", "name": "Bob" }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "perPage": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

---

## Pagination

### Offset-Based (Traditional)
```
GET /users?page=2&perPage=20

Response:
{
  "data": [...],
  "meta": {
    "pagination": {
      "page": 2,
      "perPage": 20,
      "total": 100,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPreviousPage": true
    }
  }
}
```

### Cursor-Based (For Large Datasets)
```
GET /users?cursor=eyJpZCI6IjEyMyJ9&limit=20

Response:
{
  "data": [...],
  "meta": {
    "pagination": {
      "nextCursor": "eyJpZCI6IjE0MyJ9",
      "previousCursor": "eyJpZCI6IjEwMyJ9",
      "hasMore": true
    }
  }
}
```

---

## Filtering, Sorting, Searching

### Filtering
```
GET /users?role=admin
GET /users?status=active&role=admin
GET /posts?authorId=123&published=true
```

### Sorting
```
GET /users?sortBy=createdAt&order=desc
GET /users?sort=-createdAt,name  # - prefix for descending
```

### Searching
```
GET /users?search=alice
GET /posts?q=javascript&category=tutorials
```

### Field Selection (Sparse Fieldsets)
```
GET /users?fields=id,name,email
```

---

## Relationships

### Nested Resources
```
GET    /users/123/posts           # Get user's posts
POST   /users/123/posts           # Create post for user
DELETE /users/123/posts/456       # Delete user's post
```

### Include Related Resources
```
GET /posts?include=author,comments
GET /users/123?include=posts,profile
```

### Resource References
```json
{
  "id": "456",
  "title": "My Post",
  "authorId": "123",
  "_links": {
    "author": "/users/123"
  }
}
```

---

## Versioning

### URL Versioning (Recommended)
```
GET /v1/users
GET /v2/users
```

### Header Versioning
```
GET /users
Accept: application/vnd.myapi.v1+json
```

### Query Parameter Versioning
```
GET /users?version=1
```

---

## Authentication

### Bearer Token (JWT)
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### API Key
```
X-API-Key: your-api-key-here
```

### Basic Auth (Avoid in Production)
```
Authorization: Basic base64(username:password)
```

---

## Rate Limiting

### Headers
```
X-RateLimit-Limit: 1000       # Max requests per window
X-RateLimit-Remaining: 999    # Remaining requests
X-RateLimit-Reset: 1611234567 # Unix timestamp when limit resets
```

### Response when Limited
```
HTTP/1.1 429 Too Many Requests
Retry-After: 3600

{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 1 hour."
  }
}
```

---

## HATEOAS (Hypermedia)

### Links in Response
```json
{
  "id": "123",
  "name": "Alice",
  "_links": {
    "self": "/users/123",
    "posts": "/users/123/posts",
    "followers": "/users/123/followers"
  }
}
```

---

## Bulk Operations

### Bulk Create
```
POST /users/bulk
[
  { "name": "Alice", "email": "alice@example.com" },
  { "name": "Bob", "email": "bob@example.com" }
]

Response: 207 Multi-Status
{
  "results": [
    { "status": 201, "id": "1", "name": "Alice" },
    { "status": 201, "id": "2", "name": "Bob" }
  ]
}
```

### Bulk Update
```
PATCH /users/bulk
{
  "ids": ["1", "2", "3"],
  "updates": {
    "status": "active"
  }
}
```

### Bulk Delete
```
DELETE /users/bulk
{
  "ids": ["1", "2", "3"]
}
```

---

## File Uploads

### Single File
```
POST /users/123/avatar
Content-Type: multipart/form-data

Response:
{
  "data": {
    "url": "https://cdn.example.com/avatars/123.jpg",
    "size": 102400,
    "mimeType": "image/jpeg"
  }
}
```

### Multiple Files
```
POST /posts/123/attachments
Content-Type: multipart/form-data
```

---

## Long-Running Operations

### Async Pattern
```
POST /reports
{
  "type": "sales",
  "startDate": "2026-01-01",
  "endDate": "2026-01-31"
}

Response: 202 Accepted
Location: /reports/job-456
{
  "jobId": "job-456",
  "status": "processing",
  "_links": {
    "status": "/reports/job-456/status"
  }
}

# Check status
GET /reports/job-456/status
{
  "status": "completed",
  "result": "/reports/file-789.pdf"
}
```

---

## Webhooks

### Register Webhook
```
POST /webhooks
{
  "url": "https://myapp.com/webhook",
  "events": ["user.created", "user.updated"],
  "secret": "webhook-secret-key"
}
```

### Webhook Payload
```
POST https://myapp.com/webhook
X-Webhook-Signature: sha256=...

{
  "event": "user.created",
  "timestamp": "2026-01-21T10:00:00Z",
  "data": {
    "id": "123",
    "name": "Alice"
  }
}
```

---

## Best Practices Summary

### DO
- ✅ Use nouns for resources
- ✅ Use HTTP methods correctly
- ✅ Return appropriate status codes
- ✅ Include pagination for lists
- ✅ Version your API
- ✅ Document with OpenAPI/Swagger
- ✅ Use consistent response format
- ✅ Implement rate limiting
- ✅ Use HTTPS in production

### DON'T
- ❌ Use verbs in URLs
- ❌ Return 200 for errors
- ❌ Use GET for operations with side effects
- ❌ Return entire database without pagination
- ❌ Break API without versioning
- ❌ Expose internal errors to clients
- ❌ Use different response formats per endpoint
