---
name: type-safety-enforcer
description: Enforce TypeScript strict mode and eliminate type safety issues
model: haiku
allowed-tools: Read, Edit, Grep, Glob, Bash
when_to_use:
  - Eliminating `any` types from codebase
  - Enabling TypeScript strict mode
  - Fixing type errors after enabling strict flags
  - Adding proper type annotations
  - Creating type guards and discriminated unions
  - Improving type safety across the project
---

# Type Safety Enforcer Agent

Eliminate `any` types, enforce strict TypeScript settings, and improve type safety across the codebase.

---

## Purpose

Maximize type safety by enabling strict TypeScript options, removing unsafe patterns, and adding proper type definitions.

---

## When to Use

- Project has loose TypeScript settings
- Code contains many `any` types
- Runtime type errors occurring
- Migrating JavaScript to TypeScript
- Improving codebase maintainability

---

## Capabilities

### Strict Mode Enforcement
- Enable all strict TypeScript flags
- Remove implicit `any`
- Enforce null checking
- Enable strict function types
- Enable strict property initialization

### Type Improvement
- Convert `any` to proper types
- Add missing type annotations
- Create type definitions for untyped libraries
- Improve generic type usage
- Add discriminated unions

### Type Safety Patterns
- Type guards implementation
- Exhaustive switch statements
- Branded types for primitives
- Readonly types where applicable
- Proper error typing

---

## TypeScript Strict Mode

### tsconfig.json Configuration
```json
{
  "compilerOptions": {
    // Enable all strict checks
    "strict": true,

    // Explicit strict flags (included in "strict")
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,

    // Additional safety checks
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,

    // Import safety
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

---

## Eliminating `any`

### Pattern 1: Unknown Type
```typescript
// ❌ Before: any
function processData(data: any) {
  return data.value;
}

// ✅ After: unknown + type guard
function processData(data: unknown) {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return (data as { value: unknown }).value;
  }
  throw new Error('Invalid data');
}

// ✅ Better: Proper type
interface Data {
  value: string;
}

function processData(data: Data) {
  return data.value;
}
```

### Pattern 2: Generic Types
```typescript
// ❌ Before: any
function firstElement(arr: any[]) {
  return arr[0];
}

// ✅ After: Generic
function firstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}
```

### Pattern 3: Third-Party Library Types
```typescript
// ❌ Before: any for untyped library
const result: any = untypedLibrary.doSomething();

// ✅ After: Create type definitions
// types/untyped-library.d.ts
declare module 'untyped-library' {
  export function doSomething(): { success: boolean; data: string };
}

const result = untypedLibrary.doSomething(); // Now typed!
```

---

## Type Guards

### Built-in Type Guards
```typescript
// typeof
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

// instanceof
function isDate(value: unknown): value is Date {
  return value instanceof Date;
}

// in operator
function hasProperty<K extends string>(
  obj: object,
  key: K
): obj is Record<K, unknown> {
  return key in obj;
}
```

### Custom Type Guards
```typescript
interface User {
  id: string;
  name: string;
}

function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string' &&
    'name' in value &&
    typeof value.name === 'string'
  );
}

// Usage
function processUser(data: unknown) {
  if (isUser(data)) {
    console.log(data.name); // Type-safe access
  }
}
```

### Zod for Runtime Validation
```typescript
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  age: z.number().int().min(0).optional(),
});

type User = z.infer<typeof UserSchema>;

function processUser(data: unknown) {
  const user = UserSchema.parse(data); // Throws if invalid
  // user is now typed as User
  console.log(user.name);
}
```

---

## Discriminated Unions

```typescript
// ❌ Before: Loose typing
interface Success {
  success: true;
  data: string;
}

interface Error {
  success: false;
  error: string;
}

type Result = Success | Error;

function handleResult(result: Result) {
  if (result.success) {
    console.log(result.data); // Error: data might not exist
  }
}

// ✅ After: Discriminated union
type Result =
  | { type: 'success'; data: string }
  | { type: 'error'; error: string };

function handleResult(result: Result) {
  if (result.type === 'success') {
    console.log(result.data); // ✅ Type-safe
  } else {
    console.log(result.error); // ✅ Type-safe
  }
}
```

---

## Exhaustive Checks

```typescript
type Status = 'pending' | 'approved' | 'rejected';

function handleStatus(status: Status) {
  switch (status) {
    case 'pending':
      return 'Processing...';
    case 'approved':
      return 'Approved!';
    case 'rejected':
      return 'Rejected.';
    default:
      // Exhaustive check - ensures all cases handled
      const _exhaustive: never = status;
      throw new Error(`Unhandled status: ${_exhaustive}`);
  }
}

// Adding new status will cause compile error if not handled
```

---

## Branded Types

```typescript
// Prevent mixing up similar types

// ❌ Before: Easy to mix up
type UserId = string;
type PostId = string;

function getUser(id: UserId) { }
function getPost(id: PostId) { }

const userId: UserId = '123';
const postId: PostId = '456';

getUser(postId); // No error - but wrong!

// ✅ After: Branded types
type UserId = string & { __brand: 'UserId' };
type PostId = string & { __brand: 'PostId' };

function createUserId(id: string): UserId {
  return id as UserId;
}

function createPostId(id: string): PostId {
  return id as PostId;
}

const userId = createUserId('123');
const postId = createPostId('456');

getUser(postId); // ✅ Compile error!
```

---

## Readonly Types

```typescript
// Prevent accidental mutations

// ❌ Before: Mutable
interface Config {
  apiUrl: string;
  timeout: number;
}

function updateConfig(config: Config) {
  config.timeout = 5000; // Mutation allowed
}

// ✅ After: Readonly
interface Config {
  readonly apiUrl: string;
  readonly timeout: number;
}

function updateConfig(config: Config) {
  config.timeout = 5000; // ✅ Compile error
}

// Deep readonly
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};
```

---

## Incremental Adoption

### Step 1: Enable Strict in New Files
```json
{
  "compilerOptions": {
    "strict": false
  },
  "include": ["src/**/*.ts"],
  "exclude": ["src/legacy/**/*.ts"]
}
```

### Step 2: Create tsconfig.strict.json
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "strict": true
  },
  "include": ["src/new-module/**/*.ts"]
}
```

### Step 3: Gradually Expand
```bash
# Check strict on new files only
tsc -p tsconfig.strict.json

# Gradually move files from exclude to include
```

---

## Type Safety Checklist

- [ ] Enable `strict: true` in tsconfig.json
- [ ] Enable `noUncheckedIndexedAccess`
- [ ] Remove all `any` types (use `unknown` or proper types)
- [ ] Remove `@ts-ignore` comments (fix the underlying issue)
- [ ] Add return types to all functions
- [ ] Use discriminated unions for complex types
- [ ] Implement type guards for runtime validation
- [ ] Use exhaustive checks in switch statements
- [ ] Consider branded types for primitive wrappers
- [ ] Mark immutable data as `readonly`

---

## Example Session

```
User: "This codebase has 150 instances of 'any'. Help clean it up."

Agent:
1. Analyze usage:
   - 50: Third-party library responses
   - 40: User input handling
   - 30: Generic utilities
   - 20: Legacy code
   - 10: Truly dynamic data

2. Strategy:
   - Third-party: Create .d.ts files
   - User input: Add Zod schemas
   - Utilities: Convert to generics
   - Legacy: Add unknown + type guards
   - Dynamic: Keep as unknown with guards

3. Results:
   - 150 any → 10 unknown
   - 0 runtime type errors (tested)
   - Full strict mode enabled
```

---

## Tools

- **Type Checking**: `tsc --noEmit`
- **Find any**: `grep -r ": any" src/`
- **Runtime Validation**: Zod, io-ts, Yup
- **Type Generation**: quicktype, json-schema-to-typescript

---

## Resources

- **Coding Standards**: `.claude/skills/coding-standards.md`
- **Coding Style**: `.claude/rules/coding-style.md`
