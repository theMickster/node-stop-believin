# Type Safety Guidelines

This document outlines the TypeScript and ESLint configurations that prevent `any` types and ensure type safety across the codebase.

## 🔒 TypeScript Configuration

### Critical Settings Enabled in `tsconfig.json`

```json
{
  "compilerOptions": {
    "strict": true,                           // Enables all strict type checking
    "noImplicitAny": true,                    // (included in strict) Errors on implied 'any'
    "useUnknownInCatchVariables": true,       // ⭐ Catch variables default to 'unknown' not 'any'
    "noImplicitThis": true,                   // Errors when 'this' is 'any'
    "exactOptionalPropertyTypes": true,       // Optional props cannot be 'undefined'
    "noUnusedLocals": true,                   // Errors on unused local variables
    "noImplicitReturns": true                 // All code paths must return a value
  }
}
```

### Why These Matter

- **`useUnknownInCatchVariables`**: Forces you to use `catch (err: unknown)` instead of `catch (err: any)`, making error handling type-safe
- **`strict: true`**: Enables all strict type checking options as a baseline
- **`exactOptionalPropertyTypes`**: Prevents accidentally setting optional properties to `undefined`

## 🔍 ESLint Configuration

### Rules to Prevent `any` Types

```javascript
{
  rules: {
    // Block 'any' type completely
    '@typescript-eslint/no-explicit-any': 'error',

    // Prevent unsafe operations with 'any'
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',
  }
}
```

### Test File Exceptions

Test files have relaxed rules since mocking often requires flexibility:

```javascript
{
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.spec.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'warn',  // Warning instead of error
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
      }
    }
  ]
}
```

## ✅ Best Practices for Avoiding `any`

### 1. Error Handling

❌ **Bad:**
```typescript
catch (err: any) {
  console.log(err.message);  // Unsafe!
}
```

✅ **Good:**
```typescript
import { getErrorMessage } from '@libs/guards/errorGuards';

catch (err: unknown) {
  console.log(getErrorMessage(err));  // Type-safe!
}
```

### 2. Database Error Handling

❌ **Bad:**
```typescript
catch (err: any) {
  if (err.code === 404) { /* ... */ }
}
```

✅ **Good:**
```typescript
import { isErrorWithCode } from '@libs/guards/errorGuards';

catch (err: unknown) {
  if (isErrorWithCode(err) && err.code === 404) { /* ... */ }
}
```

### 3. External Library Types

❌ **Bad:**
```typescript
const router = Router();
const routes = router.stack.filter((layer: any) => layer.route);
```

✅ **Good:**
```typescript
import { RouterLayer, isRouteLayer } from '@libs/types/expressRouterTypes';

const router = Router();
const stack = router.stack as RouterLayer[];
const routes = stack.filter(isRouteLayer);
```

### 4. Unknown Data Structures

❌ **Bad:**
```typescript
function process(data: any) {
  return data.value;
}
```

✅ **Good - Option 1: Use `unknown` with type guards:**
```typescript
function process(data: unknown): string {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return String((data as Record<string, unknown>).value);
  }
  throw new Error('Invalid data');
}
```

✅ **Good - Option 2: Define proper types:**
```typescript
interface DataStructure {
  value: string;
}

function process(data: DataStructure): string {
  return data.value;
}
```

## 🛠️ Available Type Guards

The project provides reusable type guards in `@libs/guards/errorGuards`:

### Type Guards (return boolean)
- `isErrorWithMessage(error: unknown): error is Error` - Standard errors
- `isErrorWithCode(error: unknown): error is { code: number }` - Database errors
- `isErrorWithStatus(error: unknown): error is { status: number }` - HTTP errors

### Safe Extractors (always return safe values)
- `getErrorMessage(error: unknown): string` - Always returns a string
- `toErrorObject(error: unknown): { message: string; stack?: string }` - Standardized error object

## 🚦 CI/CD Integration

### Pre-commit Hook (Recommended)

Add to `.husky/pre-commit` or `package.json`:

```json
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "lint": "eslint 'src/**/*.ts'",
    "precommit": "npm run type-check && npm run lint"
  }
}
```

### GitHub Actions / CI Pipeline

```yaml
- name: Type Check
  run: npm run type-check

- name: Lint
  run: npm run lint
```

## 📚 When to Use Each Approach

| Scenario | Solution |
|----------|----------|
| Error in catch block | `catch (err: unknown)` + `getErrorMessage(err)` |
| Database error with code | `catch (err: unknown)` + `isErrorWithCode(err)` |
| HTTP error with status | `catch (err: unknown)` + `isErrorWithStatus(err)` |
| Unknown external data | Create interface or use `unknown` with type guards |
| Third-party library types | Create type definitions in `@libs/types/` |
| Test mocks | Use `Partial<Type>` or proper mock types, avoid `any` |

## 🎯 Summary

With these configurations:

✅ TypeScript will **error** on implicit `any` types
✅ ESLint will **error** on explicit `any` usage
✅ Catch blocks will use `unknown` by default
✅ Type guards provide safe access to error properties
✅ Tests can use `any` with warnings (controlled flexibility)

**Result:** Zero `any` types in production code, maximum type safety! 🎉
