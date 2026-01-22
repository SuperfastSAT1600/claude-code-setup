# AI-Generated Code Detection Rules

Identify and fix patterns that indicate AI-generated code inconsistencies.

---

## 1. Structural Consistency

**Rule**: Similar files must follow identical patterns.

### Check For:

**Export Style Consistency:**
```typescript
// ❌ INCONSISTENT: Mixed export styles in same layer
// file1.ts
export default function handler() {}
// file2.ts
export const handler = () => {}
// file3.ts
module.exports = { handler }

// ✅ CONSISTENT: Same export style across layer
// All API routes use named exports
export async function GET() {}
export async function POST() {}
```

**Function Declaration Style:**
```typescript
// ❌ INCONSISTENT: Mixed function styles
function processUser() {}      // Declaration
const processOrder = () => {}  // Arrow
const processPayment = function() {} // Expression

// ✅ CONSISTENT: Pick one style per context
// Hooks and handlers: arrow functions
const handleClick = () => {}
const useAuth = () => {}
// Utility functions: declarations
function formatDate() {}
function validateEmail() {}
```

**Error Handling Patterns:**
```typescript
// ❌ INCONSISTENT: Different error handling in similar functions
async function getUser() {
  try { return await db.user.find() }
  catch (e) { throw e }
}
async function getOrder() {
  const result = await db.order.find().catch(() => null)
  if (!result) throw new Error('Not found')
}

// ✅ CONSISTENT: Same pattern across similar operations
async function getUser() {
  return await db.user.find().catch(handleDbError)
}
async function getOrder() {
  return await db.order.find().catch(handleDbError)
}
```

---

## 2. Over-Engineering Detection

**Rule**: Avoid unnecessary abstractions. Code should be as simple as possible.

### Red Flags:

**Single-Use Interfaces:**
```typescript
// ❌ OVER-ENGINEERED: Interface used only once
interface UserCreationOptions {
  name: string
  email: string
}
function createUser(options: UserCreationOptions) {}

// ✅ SIMPLER: Inline type or direct params
function createUser(name: string, email: string) {}
// OR for many params
function createUser(data: { name: string; email: string }) {}
```

**Wrapper Functions That Add Nothing:**
```typescript
// ❌ OVER-ENGINEERED: Wrapper adds nothing
function fetchUserData(userId: string) {
  return fetchUser(userId)
}

// ✅ SIMPLER: Just use the original function
const user = await fetchUser(userId)
```

**Factory Functions for Simple Objects:**
```typescript
// ❌ OVER-ENGINEERED: Factory for simple config
function createConfig() {
  return { timeout: 5000, retries: 3 }
}
const config = createConfig()

// ✅ SIMPLER: Direct object
const config = { timeout: 5000, retries: 3 }
```

**Excessive Design Patterns:**
```typescript
// ❌ OVER-ENGINEERED: Strategy pattern for two options
interface PaymentStrategy { process(): void }
class CreditCardStrategy implements PaymentStrategy {}
class PayPalStrategy implements PaymentStrategy {}
class PaymentContext { constructor(strategy: PaymentStrategy) {} }

// ✅ SIMPLER: Conditional or switch
function processPayment(method: 'card' | 'paypal') {
  if (method === 'card') return processCard()
  return processPayPal()
}
```

---

## 3. Verbose Code Detection

**Rule**: Code should be concise. Avoid stating the obvious.

### Red Flags:

**Obvious Comments:**
```typescript
// ❌ VERBOSE: Comments state what code does
// Increment the counter
counter++
// Check if user is logged in
if (user.isLoggedIn) {}
// Return the result
return result

// ✅ BETTER: No comments needed for obvious code
counter++
if (user.isLoggedIn) {}
return result
```

**Over-Descriptive Variable Names:**
```typescript
// ❌ VERBOSE: Too descriptive
const userEmailAddressString = user.email
const isUserCurrentlyLoggedInBoolean = user.isLoggedIn
const listOfAllUserOrdersArray = orders

// ✅ BETTER: Clear but concise
const email = user.email
const isLoggedIn = user.isLoggedIn
const orders = user.orders
```

**Redundant Type Annotations:**
```typescript
// ❌ VERBOSE: Types that TypeScript infers
const count: number = 5
const name: string = 'Alice'
const items: string[] = ['a', 'b']
const user: User = new User()

// ✅ BETTER: Let TypeScript infer
const count = 5
const name = 'Alice'
const items = ['a', 'b']
const user = new User()
```

---

## 4. Kitchen Sink Detection

**Rule**: Don't handle impossible scenarios.

### Red Flags:

**Impossible Error Cases:**
```typescript
// ❌ KITCHEN SINK: Handles impossible case
function add(a: number, b: number): number {
  if (typeof a !== 'number') throw new Error('a must be number')
  if (typeof b !== 'number') throw new Error('b must be number')
  return a + b
}

// ✅ BETTER: TypeScript guarantees types
function add(a: number, b: number): number {
  return a + b
}
```

**Duplicate Framework Validation:**
```typescript
// ❌ KITCHEN SINK: Framework already validates
app.post('/users', (req, res) => {
  if (!req.body) throw new Error('Body required')  // Express guarantees body
  if (!req.method) throw new Error('Method required')  // Always present
})

// ✅ BETTER: Trust the framework
app.post('/users', (req, res) => {
  const { name, email } = req.body
})
```

**Excessive Null Checks:**
```typescript
// ❌ KITCHEN SINK: Over-defensive
function getFullName(user: User): string {
  if (!user) return ''
  if (!user.firstName) return ''
  if (!user.lastName) return user.firstName || ''
  return `${user.firstName || ''} ${user.lastName || ''}`
}

// ✅ BETTER: Trust the type
function getFullName(user: User): string {
  return `${user.firstName} ${user.lastName}`
}
```

---

## 5. Copy-Paste Drift Detection

**Rule**: Similar logic should be centralized, not duplicated with variations.

### Red Flags:

**Utility Functions Recreated:**
```typescript
// ❌ DRIFT: Same logic, different implementations
// file1.ts
const formatDate = (d: Date) => d.toISOString().split('T')[0]
// file2.ts
const dateFormat = (date: Date) => date.toLocaleDateString()
// file3.ts
function getDateString(dt: Date) { return dt.toDateString() }

// ✅ BETTER: Single shared utility
// utils/date.ts
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}
```

**Inconsistent Naming for Same Concept:**
```typescript
// ❌ DRIFT: Same concept, different names
// userService.ts
async function getUserById(id: string) {}
// orderService.ts
async function fetchOrder(orderId: string) {}
// productService.ts
async function loadProduct(productId: string) {}

// ✅ BETTER: Consistent naming pattern
async function getById(id: string) {}  // All services
// OR use specific consistent pattern
async function getUser(id: string) {}
async function getOrder(id: string) {}
async function getProduct(id: string) {}
```

---

## 6. Unnatural Code Flow

**Rule**: Code flow should be idiomatic for the language/framework.

### Red Flags:

**Unnecessary Async/Await:**
```typescript
// ❌ UNNATURAL: Async not needed
async function getConfig() {
  return { timeout: 5000 }  // No async operation
}

// ✅ BETTER: Remove async
function getConfig() {
  return { timeout: 5000 }
}
```

**Mixed Promise Styles:**
```typescript
// ❌ UNNATURAL: Mixing styles
async function process() {
  const user = await getUser()
  return getOrders(user.id).then(orders => {
    return orders.map(o => o.id)
  })
}

// ✅ BETTER: Consistent async/await
async function process() {
  const user = await getUser()
  const orders = await getOrders(user.id)
  return orders.map(o => o.id)
}
```

**Over-Defensive Guards:**
```typescript
// ❌ UNNATURAL: Too many guards
function processUser(user: User | null | undefined) {
  if (!user) return null
  if (!user.id) return null
  if (typeof user.id !== 'string') return null
  if (user.id.length === 0) return null
  return doSomething(user)
}

// ✅ BETTER: Trust the type system
function processUser(user: User) {
  return doSomething(user)
}
```

---

## 7. Documentation Mismatch

**Rule**: Documentation must match implementation.

### Red Flags:

**JSDoc Doesn't Match Function:**
```typescript
// ❌ MISMATCH: Docs don't match
/**
 * Gets a user by their email address
 * @param email - The user's email
 * @returns The user object
 */
function getUserById(id: string): User {}  // Actually takes ID!

// ✅ BETTER: Accurate docs
/**
 * Gets a user by their ID
 * @param id - The user's unique identifier
 * @returns The user object
 */
function getUserById(id: string): User {}
```

**Comments Reference Old Code:**
```typescript
// ❌ MISMATCH: Comment references deleted code
// After validating the token, we check the user's role
const user = await db.user.find({ id })  // No token validation here!

// ✅ BETTER: Remove stale comment or update
const user = await db.user.find({ id })
```

---

## 8. Template Smell Detection

**Rule**: Remove placeholder content and address TODOs.

### Red Flags:

**Unaddressed TODOs:**
```typescript
// ❌ TEMPLATE SMELL: TODO left in production code
function processPayment() {
  // TODO: implement actual payment processing
  return { success: true }
}

// ✅ BETTER: Either implement or remove
function processPayment() {
  return stripe.charges.create(...)
}
```

**Generic Error Messages:**
```typescript
// ❌ TEMPLATE SMELL: Placeholder error
throw new Error('Something went wrong')
throw new Error('An error occurred')

// ✅ BETTER: Specific error
throw new Error('Failed to process payment: invalid card')
throw new PaymentError('Card declined', { code: 'card_declined' })
```

**Placeholder Values:**
```typescript
// ❌ TEMPLATE SMELL: Obviously fake data
const API_KEY = 'your-api-key-here'
const config = { name: 'TODO', version: '0.0.0' }

// ✅ BETTER: Real values or environment variables
const API_KEY = process.env.API_KEY
const config = { name: 'my-app', version: '1.0.0' }
```

---

## 9. Naming Consistency

**Rule**: Same concepts must have same names across codebase.

### Naming Patterns to Enforce:

| Concept | Consistent Name | Avoid |
|---------|-----------------|-------|
| Loading state | `isLoading` | `loading`, `isLoadingData`, `dataLoading` |
| Error state | `error` | `err`, `errorMessage`, `errorState` |
| Submit handler | `handleSubmit` | `onSubmit`, `submitHandler`, `doSubmit` |
| Fetch data | `getX` or `fetchX` | mixing `getUser`, `fetchOrder`, `loadProduct` |
| Boolean props | `isX`, `hasX`, `shouldX` | `x` without prefix |

---

## 10. Configuration File Consistency

**Rule**: All configuration files of same type must use same schema.

### Check For:

**Schema Presence:**
```json
// ❌ INCONSISTENT: Missing schema
{ "name": "app" }

// ✅ CONSISTENT: Schema present
{ "$schema": "...", "name": "app" }
```

**Property Naming:**
```json
// ❌ INCONSISTENT: Typos and variations
{ "disabledMcpjsonServers": [] }  // Typo!
{ "disabled_mcp_servers": [] }    // Wrong case

// ✅ CONSISTENT: Correct property name
{ "disabledMcpServers": [] }
```

---

## Detection Checklist

When reviewing code, check for:

- [ ] Export styles consistent across similar files
- [ ] Function declaration styles consistent per context
- [ ] Error handling follows same pattern
- [ ] No single-use interfaces or wrapper functions
- [ ] No obvious comments or verbose variable names
- [ ] No handling of impossible error cases
- [ ] No duplicate utility implementations
- [ ] Async/await used consistently
- [ ] Documentation matches implementation
- [ ] No TODO comments or placeholder values
- [ ] Naming conventions followed consistently
- [ ] Configuration files use same schema

---

## Automated Checks

Add to CI/CD:

```bash
# Find TODO comments
grep -r "TODO" src/ --include="*.ts"

# Find console.log in production
grep -r "console.log" src/ --include="*.ts"

# Find generic error messages
grep -r "Something went wrong" src/ --include="*.ts"

# Check for placeholder values
grep -r "your-.*-here" src/ --include="*.ts"
```

---

## Resources

- Consistent Code Style: See `.claude/rules/coding-style.md`
- API Design: See `.claude/rules/api-design.md`
- Testing Standards: See `.claude/rules/testing.md`
