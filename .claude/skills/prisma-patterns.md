# Prisma Patterns

Quick reference for Prisma ORM patterns and best practices with PostgreSQL/MySQL.

## Schema Design

### Basic Types
- String, Int, Float, Boolean, DateTime
- Optional: `field String?`
- Default values: `@default(value)`
- Auto-increment: `@default(autoincrement())`
- UUID: `@default(uuid())`
- Timestamps: `@default(now())` and `@updatedAt`

### Relationships
- One-to-many: `posts Post[]` on User, `userId String` + `user User @relation(fields: [userId], references: [id])` on Post
- Many-to-many: Implicit (list on both sides) or explicit (join table model)
- One-to-one: Unique relation field

### Indexes
- Single: `@@index([field])`
- Composite: `@@index([field1, field2])`
- Unique: `@@unique([field])` or `@unique` on field

### Enums
Define with `enum` keyword, use as field type

## Query Patterns

### CRUD Operations
- Create: `prisma.model.create({ data })`
- Read: `prisma.model.findUnique({ where })`, `findMany`, `findFirst`
- Update: `prisma.model.update({ where, data })`
- Delete: `prisma.model.delete({ where })`
- Upsert: `prisma.model.upsert({ where, create, update })`

### Filtering
- Equals: `where: { field: value }`
- Not: `field: { not: value }`
- In: `field: { in: [values] }`
- Contains: `field: { contains: 'text' }`
- Starts/ends with: `startsWith`, `endsWith`
- Comparison: `gt`, `gte`, `lt`, `lte`
- AND/OR: `AND: [conditions]`, `OR: [conditions]`

### Including Relations
- Include: `include: { relation: true }`
- Nested include: `include: { relation: { include: { nested: true }}}`
- Select specific fields: `select: { field1: true, field2: true }`

### Ordering & Pagination
- Order: `orderBy: { field: 'asc' | 'desc' }`
- Skip: `skip: offset`
- Take: `take: limit`
- Cursor-based: `cursor: { id: lastId }, skip: 1, take: 20`

## Advanced Patterns

### Transactions
- Sequential: `prisma.$transaction([op1, op2])`
- Interactive: `prisma.$transaction(async (tx) => { ... })`

### Raw Queries
- Raw: `prisma.$queryRaw`
- Execute: `prisma.$executeRaw`
- Use for complex queries, aggregations

### Aggregations
- Count: `_count`
- Sum, avg, min, max: `_sum`, `_avg`, `_min`, `_max`
- Group by: `groupBy({ by: ['field'], _count: true })`

### Middleware
Intercept queries for logging, soft deletes, validation

## Performance Optimization

### Connection Pooling
Configure in database URL connection limit

### Query Optimization
- Select only needed fields
- Use includes wisely (avoid N+1)
- Add indexes for frequently queried fields
- Use cursor pagination for large datasets

### Batch Operations
- createMany for bulk inserts
- updateMany for bulk updates
- deleteMany for bulk deletes

## Migration Patterns

### Development Workflow
1. Modify schema.prisma
2. Run `prisma migrate dev`
3. Review migration SQL
4. Commit migration files

### Production Workflow
1. Run `prisma migrate deploy` in CI/CD
2. Never use `migrate dev` in production

### Migration Commands
- Create: `prisma migrate dev --name description`
- Deploy: `prisma migrate deploy`
- Reset: `prisma migrate reset` (dev only)
- Status: `prisma migrate status`

## Type Safety Patterns

### Generated Types
Use Prisma-generated types: `Prisma.ModelCreateInput`, `Prisma.ModelUpdateInput`

### Type Utilities
- Select: Define included fields type
- Include: Define included relations type
- Omit fields: Use TypeScript's `Omit`

## Error Handling

### Common Errors
- P2002: Unique constraint violation
- P2025: Record not found
- P2003: Foreign key constraint violation

### Error Pattern
Catch Prisma errors, map to application errors with user-friendly messages

## Testing Patterns

### Test Database
- Use separate test database
- Reset between tests
- Seed with test data

### Mocking
Mock Prisma Client for unit tests using jest or factory pattern

## Best Practices

### DO
- Use transactions for multi-step operations
- Add indexes for foreign keys and frequently queried fields
- Use enums for fixed sets of values
- Validate input before Prisma operations
- Handle Prisma errors gracefully
- Use connection pooling
- Keep migrations small and focused

### DON'T
- Expose Prisma client directly to frontend
- Skip migrations in production
- Use `prisma db push` in production
- Store passwords without hashing
- Use SELECT * (use select specific fields)
- Forget to close client in serverless

## Common Patterns

### Soft Delete
Add `deletedAt DateTime?` field, filter in queries

### Audit Trail
Add `createdAt`, `updatedAt`, `createdBy`, `updatedBy` fields

### Pagination Helper
Create reusable pagination function with skip/take or cursor

### Search Pattern
Use full-text search with database-specific features or external search service

### Repository Pattern
Wrap Prisma queries in repository layer for abstraction

## Seeding

### Seed Script
Create `prisma/seed.ts`, run with `prisma db seed`

### Seed Pattern
- Check if data exists before seeding
- Use upsert for idempotency
- Seed in correct order (respect foreign keys)

## Schema Organization

### Multiple Schemas
Use generator and datasource blocks, organize by domain

### Naming Conventions
- Models: PascalCase singular (User, Post)
- Fields: camelCase (userId, createdAt)
- Relations: plural for many (posts), singular for one (author)

## Deployment

### Environment Variables
Store DATABASE_URL in environment, never commit

### Migration in CI/CD
Run `prisma migrate deploy` in deployment pipeline

### Client Generation
Run `prisma generate` after npm install or in build step

## Troubleshooting

### Common Issues
- "Client not found": Run `prisma generate`
- Migration conflicts: Resolve manually or reset
- Connection errors: Check DATABASE_URL and network
- Type errors: Regenerate client with `prisma generate`

### Debug Mode
Enable with `DEBUG=prisma:*` to see SQL queries
