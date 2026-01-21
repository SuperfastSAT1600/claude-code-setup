# GraphQL Patterns

Best practices and patterns for building GraphQL APIs with proper schema design, resolvers, and performance optimization.

---

## Schema Design

### Naming Conventions
- Types: PascalCase (`User`, `Post`)
- Fields: camelCase (`firstName`, `createdAt`)
- Enums: SCREAMING_SNAKE_CASE (`PUBLISHED`, `DRAFT`)
- Input types: Suffix with `Input` (`CreateUserInput`)

### Basic Schema
```graphql
type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
  createdAt: DateTime!
}

type Post {
  id: ID!
  title: String!
  content: String!
  published: Boolean!
  author: User!
  comments: [Comment!]!
}

type Query {
  user(id: ID!): User
  users(limit: Int, offset: Int): [User!]!
  post(id: ID!): Post
  posts(published: Boolean): [Post!]!
}

type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  deleteUser(id: ID!): Boolean!
}

input CreateUserInput {
  name: String!
  email: String!
  password: String!
}

input UpdateUserInput {
  name: String
  email: String
}
```

---

## Resolvers

### Basic Resolver Pattern
```typescript
export const resolvers = {
  Query: {
    user: async (_parent, { id }, context) => {
      return await context.db.user.findUnique({ where: { id } });
    },

    users: async (_parent, { limit = 20, offset = 0 }, context) => {
      return await context.db.user.findMany({
        take: limit,
        skip: offset,
      });
    },
  },

  Mutation: {
    createUser: async (_parent, { input }, context) => {
      // Authorization check
      if (!context.user) {
        throw new Error('Unauthorized');
      }

      return await context.db.user.create({
        data: input,
      });
    },
  },

  // Field resolvers
  User: {
    posts: async (parent, _args, context) => {
      return await context.db.post.findMany({
        where: { authorId: parent.id },
      });
    },
  },

  Post: {
    author: async (parent, _args, context) => {
      // Use DataLoader to batch
      return context.loaders.userLoader.load(parent.authorId);
    },
  },
};
```

---

## DataLoader (N+1 Solution)

### Problem: N+1 Queries
```graphql
query {
  posts {       # 1 query
    title
    author {    # N queries (one per post!)
      name
    }
  }
}
```

### Solution: DataLoader
```typescript
import DataLoader from 'dataloader';

export function createLoaders(db) {
  return {
    userLoader: new DataLoader(async (userIds: readonly string[]) => {
      // Single batched query
      const users = await db.user.findMany({
        where: { id: { in: [...userIds] } },
      });

      // Return in same order as requested
      const userMap = new Map(users.map(u => [u.id, u]));
      return userIds.map(id => userMap.get(id) || null);
    }),
  };
}

// Add to context
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({
    db,
    loaders: createLoaders(db),
    user: getUserFromToken(req),
  }),
});
```

---

## Pagination

### Offset-Based
```graphql
type Query {
  users(offset: Int, limit: Int): UserConnection!
}

type UserConnection {
  nodes: [User!]!
  totalCount: Int!
  pageInfo: PageInfo!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
}
```

### Cursor-Based (Relay)
```graphql
type Query {
  users(
    first: Int
    after: String
    last: Int
    before: String
  ): UserConnection!
}

type UserConnection {
  edges: [UserEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type UserEdge {
  node: User!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
```

---

## Filtering & Sorting

### Filter Input
```graphql
input UserFilter {
  name: String
  email: String
  role: UserRole
  createdAfter: DateTime
}

type Query {
  users(filter: UserFilter, orderBy: UserOrderBy): [User!]!
}

enum UserOrderBy {
  NAME_ASC
  NAME_DESC
  CREATED_AT_ASC
  CREATED_AT_DESC
}
```

### Implementation
```typescript
Query: {
  users: async (_parent, { filter, orderBy }, context) => {
    const where = {};

    if (filter?.name) {
      where.name = { contains: filter.name, mode: 'insensitive' };
    }

    if (filter?.role) {
      where.role = filter.role;
    }

    const orderByMap = {
      NAME_ASC: { name: 'asc' },
      NAME_DESC: { name: 'desc' },
      CREATED_AT_ASC: { createdAt: 'asc' },
      CREATED_AT_DESC: { createdAt: 'desc' },
    };

    return await context.db.user.findMany({
      where,
      orderBy: orderByMap[orderBy] || { createdAt: 'desc' },
    });
  },
}
```

---

## Interfaces & Unions

### Interfaces
```graphql
interface Node {
  id: ID!
  createdAt: DateTime!
}

type User implements Node {
  id: ID!
  name: String!
  createdAt: DateTime!
}

type Post implements Node {
  id: ID!
  title: String!
  createdAt: DateTime!
}

type Query {
  node(id: ID!): Node
}
```

### Unions
```graphql
union SearchResult = User | Post | Comment

type Query {
  search(query: String!): [SearchResult!]!
}

# Query usage
query {
  search(query: "typescript") {
    ... on User {
      name
      email
    }
    ... on Post {
      title
      content
    }
    ... on Comment {
      text
    }
  }
}
```

---

## Subscriptions (Real-time)

### Schema
```graphql
type Subscription {
  postAdded: Post!
  commentAdded(postId: ID!): Comment!
  userUpdated(userId: ID!): User!
}
```

### Implementation
```typescript
import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();

export const resolvers = {
  Subscription: {
    postAdded: {
      subscribe: () => pubsub.asyncIterator(['POST_ADDED']),
    },

    commentAdded: {
      subscribe: (_parent, { postId }) => {
        return pubsub.asyncIterator([`COMMENT_ADDED_${postId}`]);
      },
    },
  },

  Mutation: {
    createPost: async (_parent, { input }, context) => {
      const post = await context.db.post.create({ data: input });

      // Publish event
      pubsub.publish('POST_ADDED', { postAdded: post });

      return post;
    },
  },
};
```

### Client Usage
```typescript
import { useSubscription, gql } from '@apollo/client';

const POST_ADDED = gql`
  subscription OnPostAdded {
    postAdded {
      id
      title
      author {
        name
      }
    }
  }
`;

function LatestPost() {
  const { data, loading } = useSubscription(POST_ADDED);

  if (loading) return <p>Waiting...</p>;
  if (!data) return null;

  return (
    <div>
      <h3>{data.postAdded.title}</h3>
      <p>By: {data.postAdded.author.name}</p>
    </div>
  );
}
```

---

## Error Handling

### Custom Errors
```typescript
import { GraphQLError } from 'graphql';

class NotFoundError extends GraphQLError {
  constructor(message: string) {
    super(message, {
      extensions: {
        code: 'NOT_FOUND',
        http: { status: 404 },
      },
    });
  }
}

class AuthenticationError extends GraphQLError {
  constructor(message: string) {
    super(message, {
      extensions: {
        code: 'UNAUTHENTICATED',
        http: { status: 401 },
      },
    });
  }
}

// Usage in resolver
Query: {
  user: async (_parent, { id }, context) => {
    const user = await context.db.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  },
}
```

### Partial Errors
```json
{
  "data": {
    "user": {
      "name": "Alice",
      "posts": null
    }
  },
  "errors": [
    {
      "message": "Failed to load posts",
      "path": ["user", "posts"],
      "extensions": {
        "code": "INTERNAL_SERVER_ERROR"
      }
    }
  ]
}
```

---

## Authorization

### Field-Level Authorization
```typescript
User: {
  email: (parent, _args, context) => {
    // Only return email to the user themselves or admins
    if (context.user?.id === parent.id || context.user?.isAdmin) {
      return parent.email;
    }
    return null;
  },
}
```

### Directive-Based
```graphql
directive @auth(requires: Role = USER) on OBJECT | FIELD_DEFINITION

enum Role {
  USER
  ADMIN
}

type Query {
  users: [User!]! @auth(requires: ADMIN)
  me: User @auth(requires: USER)
  publicPosts: [Post!]!  # No auth required
}
```

---

## Query Complexity

### Limiting Query Depth
```typescript
import { createComplexityLimitRule } from 'graphql-validation-complexity';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  validationRules: [
    createComplexityLimitRule(1000, {
      scalarCost: 1,
      objectCost: 2,
      listFactor: 10,
    }),
  ],
});
```

### Cost Analysis
```graphql
# Cost: 1 (query) + 2 (user) + 10 (posts list) + 20 (comments list) = 33
query {
  user(id: "1") {        # Cost: 2
    name
    posts {              # Cost: 10 (list)
      title
      comments {         # Cost: 20 (nested list)
        text
      }
    }
  }
}
```

---

## Caching

### Field-Level Caching
```typescript
import { InMemoryLRUCache } from '@apollo/utils.keyvaluecache';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  cache: new InMemoryLRUCache({
    maxSize: 1000,
    ttl: 300, // 5 minutes
  }),
});

// In resolver
Query: {
  user: async (_parent, { id }, { cache, db }) => {
    const cacheKey = `user:${id}`;
    const cached = await cache.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const user = await db.user.findUnique({ where: { id } });
    await cache.set(cacheKey, JSON.stringify(user), { ttl: 300 });

    return user;
  },
}
```

### HTTP Caching
```typescript
type Query {
  posts: [Post!]! @cacheControl(maxAge: 300)  # 5 minutes
  user(id: ID!): User @cacheControl(maxAge: 60, scope: PRIVATE)
}
```

---

## Best Practices

### Schema Design
- ✅ Use meaningful, descriptive names
- ✅ Keep types focused and cohesive
- ✅ Use enums for fixed sets of values
- ✅ Make required fields non-nullable (`!`)
- ✅ Use interfaces for shared fields

### Resolvers
- ✅ Use DataLoader to prevent N+1 queries
- ✅ Keep resolvers thin (delegate to services)
- ✅ Handle errors gracefully
- ✅ Validate permissions in resolvers
- ✅ Return consistent error formats

### Performance
- ✅ Implement query complexity limits
- ✅ Use caching strategically
- ✅ Batch database queries
- ✅ Add indexes for frequently queried fields
- ✅ Monitor resolver performance

### DON'T
- ❌ Return null for errors (use proper error handling)
- ❌ Expose internal IDs directly
- ❌ Allow unlimited query depth
- ❌ Skip authorization checks
- ❌ Put business logic in resolvers
