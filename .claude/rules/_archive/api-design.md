# API Design Rules

Standards for designing consistent, maintainable REST and GraphQL APIs.

---

## 1. Resource Naming

**Rule**: Use plural nouns for resources, kebab-case for multi-word names.

### Correct Examples:
```
GET    /api/users           # List users
GET    /api/users/:id       # Get single user
POST   /api/users           # Create user
GET    /api/blog-posts      # Multi-word: kebab-case
GET    /api/user-profiles   # Consistent naming
```

### Incorrect Examples:
```
GET    /api/user            # ❌ Singular
GET    /api/getUsers        # ❌ Verb in resource name
GET    /api/user_profiles   # ❌ Snake_case
GET    /api/userProfiles    # ❌ camelCase
```

---

## 2. HTTP Methods

**Rule**: Use correct HTTP methods for operations.

| Method | Purpose | Idempotent | Safe |
|--------|---------|------------|------|
| GET | Read resource(s) | Yes | Yes |
| POST | Create resource | No | No |
| PUT | Replace resource | Yes | No |
| PATCH | Partial update | Yes | No |
| DELETE | Remove resource | Yes | No |

### Correct:
```
GET    /api/users           # Read all users
GET    /api/users/:id       # Read single user
POST   /api/users           # Create user
PATCH  /api/users/:id       # Update user fields
DELETE /api/users/:id       # Delete user
```

### Incorrect:
```
POST   /api/users/get       # ❌ Using POST for read
GET    /api/users/delete/1  # ❌ Using GET for delete
POST   /api/users/1/update  # ❌ Verb in URL
```

---

## 3. Response Format

**Rule**: All responses must follow a consistent format.

### Success Response:
```typescript
// Single resource
{
  "data": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}

// Collection
{
  "data": [
    { "id": "1", "name": "Item 1" },
    { "id": "2", "name": "Item 2" }
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

### Error Response:
```typescript
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ],
    "requestId": "req_abc123"
  }
}
```

---

## 4. HTTP Status Codes

**Rule**: Use appropriate status codes.

### Success Codes:
| Code | Meaning | Use Case |
|------|---------|----------|
| 200 | OK | Successful GET, PATCH, DELETE |
| 201 | Created | Successful POST creating resource |
| 204 | No Content | Successful DELETE with no body |

### Client Error Codes:
| Code | Meaning | Use Case |
|------|---------|----------|
| 400 | Bad Request | Invalid input/validation error |
| 401 | Unauthorized | Missing/invalid authentication |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate/conflict error |
| 422 | Unprocessable Entity | Semantic validation error |
| 429 | Too Many Requests | Rate limit exceeded |

### Server Error Codes:
| Code | Meaning | Use Case |
|------|---------|----------|
| 500 | Internal Server Error | Unexpected server error |
| 502 | Bad Gateway | Upstream service error |
| 503 | Service Unavailable | Service temporarily down |

---

## 5. Pagination

**Rule**: All list endpoints must support pagination.

### Offset-Based (Simple):
```
GET /api/users?page=2&perPage=20

Response:
{
  "data": [...],
  "meta": {
    "pagination": {
      "page": 2,
      "perPage": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

### Cursor-Based (Performant):
```
GET /api/users?cursor=eyJpZCI6MTAwfQ&limit=20

Response:
{
  "data": [...],
  "meta": {
    "pagination": {
      "nextCursor": "eyJpZCI6MTIwfQ",
      "hasMore": true
    }
  }
}
```

### Requirements:
- Default page size: 20
- Maximum page size: 100
- Include total count (offset) or hasMore (cursor)

---

## 6. Filtering and Sorting

**Rule**: Use consistent query parameter patterns.

### Filtering:
```
GET /api/users?status=active
GET /api/users?role=admin,moderator        # Multiple values
GET /api/users?createdAt[gte]=2024-01-01   # Range filter
GET /api/posts?author.name=John            # Nested filter
```

### Sorting:
```
GET /api/users?sort=createdAt              # Ascending
GET /api/users?sort=-createdAt             # Descending (prefix -)
GET /api/users?sort=-createdAt,name        # Multiple fields
```

### Searching:
```
GET /api/users?search=john                 # Full-text search
GET /api/users?q=john                      # Alternative
```

---

## 7. Versioning

**Rule**: API versions must be in the URL path.

### Correct:
```
GET /api/v1/users
GET /api/v2/users
```

### Incorrect:
```
GET /api/users?version=1      # ❌ Query param
X-API-Version: 1              # ❌ Header (harder to debug)
```

### Version Lifecycle:
1. v1 released → stable
2. v2 in development → beta
3. v2 released → v1 deprecated
4. After deprecation period → v1 removed

---

## 8. Nested Resources

**Rule**: Limit nesting to one level. Use query params for deeper relations.

### Correct:
```
GET /api/users/:userId/posts              # User's posts
GET /api/posts?authorId=123               # Alternative
GET /api/posts/:postId/comments           # Post's comments
```

### Incorrect:
```
GET /api/users/:userId/posts/:postId/comments/:commentId/likes
# ❌ Too deeply nested - use flat structure:
GET /api/comments/:commentId/likes
```

---

## 9. Error Codes

**Rule**: Use consistent, documented error codes.

### Standard Error Codes:
```typescript
const ERROR_CODES = {
  // Validation
  VALIDATION_ERROR: 'Input validation failed',
  INVALID_FORMAT: 'Invalid data format',

  // Authentication
  UNAUTHORIZED: 'Authentication required',
  INVALID_TOKEN: 'Invalid or expired token',
  TOKEN_EXPIRED: 'Token has expired',

  // Authorization
  FORBIDDEN: 'Insufficient permissions',
  RESOURCE_FORBIDDEN: 'Cannot access this resource',

  // Resources
  NOT_FOUND: 'Resource not found',
  ALREADY_EXISTS: 'Resource already exists',
  CONFLICT: 'Resource conflict',

  // Rate limiting
  RATE_LIMITED: 'Too many requests',

  // Server
  INTERNAL_ERROR: 'Internal server error',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
};
```

---

## 10. API Security

**Rule**: All APIs must implement security best practices.

### Authentication:
```typescript
// Bearer token in header
Authorization: Bearer <jwt-token>

// API key (for server-to-server)
X-API-Key: <api-key>
```

### Required Headers:
```typescript
// Request
Content-Type: application/json
Authorization: Bearer <token>

// Response
X-Request-Id: req_abc123
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

### Rate Limiting:
- Default: 100 requests/minute
- Authenticated: 1000 requests/minute
- Include rate limit headers in responses

---

## API Design Checklist

Before deploying an API:
- [ ] Resource names are plural and kebab-case
- [ ] Correct HTTP methods used
- [ ] Response format is consistent
- [ ] Appropriate status codes returned
- [ ] Pagination implemented for lists
- [ ] Filtering and sorting supported
- [ ] Version included in URL
- [ ] Error codes documented
- [ ] Authentication required where needed
- [ ] Rate limiting configured
- [ ] OpenAPI spec updated

---

## Resources

- [REST API Design Best Practices](https://restfulapi.net/)
- [Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines)
- [JSON:API Specification](https://jsonapi.org/)
