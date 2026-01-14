# Server Actions vs API Routes in Next.js

## Overview

In Next.js, there are two primary ways to handle server-side logic and data mutations:
1. **Server Actions** (introduced in Next.js 13+)
2. **API Routes** (traditional approach)

Understanding when to use each is crucial for building efficient and maintainable Next.js applications.

---

## What are Server Actions?

Server Actions are **async functions** that run on the server. They're defined with the `'use server'` directive and can be called directly from Client Components, Server Components, or other Server Actions.

### Key Characteristics:
- **Direct function calls** - No HTTP overhead
- **Type-safe** - Full TypeScript support
- **Automatic serialization** - Data is automatically serialized/deserialized
- **Integrated with React** - Work seamlessly with React Server Components
- **Cookie/Session access** - Can access cookies and session data directly
- **Form actions** - Can be used directly in HTML forms

### Syntax:
```typescript
'use server';

export async function myServerAction(data: MyType) {
  // Server-side logic
  return result;
}
```

---

## What are API Routes?

API Routes are **HTTP endpoints** built on top of the Next.js routing system. They follow the REST API pattern and return JSON responses.

### Key Characteristics:
- **HTTP endpoints** - Accessible via HTTP methods (GET, POST, PUT, DELETE, etc.)
- **RESTful** - Follow REST conventions
- **External access** - Can be called from anywhere (browser, mobile apps, external services)
- **Manual serialization** - You handle request/response serialization
- **Status codes** - Return proper HTTP status codes
- **Headers** - Can set custom headers

### Syntax:
```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Handle GET request
  return NextResponse.json({ data: 'value' });
}

export async function POST(request: NextRequest) {
  // Handle POST request
  return NextResponse.json({ success: true }, { status: 201 });
}
```

---

## Key Differences

| Feature | Server Actions | API Routes |
|---------|---------------|------------|
| **Invocation** | Direct function call | HTTP request (fetch/axios) |
| **Performance** | Lower overhead (no HTTP) | Higher overhead (HTTP protocol) |
| **Type Safety** | Full TypeScript support | Manual typing required |
| **Serialization** | Automatic | Manual (JSON.stringify/parse) |
| **Form Integration** | Native support (`action` prop) | Requires fetch/FormData |
| **External Access** | No (only from same app) | Yes (from anywhere) |
| **Middleware** | Runs in server context | Can be excluded from middleware |
| **Authentication** | Direct cookie/session access | Requires middleware or manual handling |
| **Error Handling** | Throws errors (try/catch) | Returns status codes |
| **Caching** | Integrated with React Cache | Manual cache headers |

---

## When to Use Server Actions

### ✅ Use Server Actions for:

1. **Form Submissions**
   ```tsx
   // Direct form integration
   <form action={updateUser}>
     <input name="usertag" />
     <button type="submit">Save</button>
   </form>
   ```

2. **Data Mutations from Client Components**
   ```typescript
   // app/actions/user.ts
   'use server';
   
   export async function updateUser(data: UserData) {
     // Update logic
   }
   
   // In Client Component
   const handleSave = async () => {
     await updateUser(formData); // Direct function call
   };
   ```

3. **Operations Requiring Authentication** (when middleware excludes API routes)
   ```typescript
   'use server';
   import { withAuth } from '@workos-inc/authkit-nextjs';
   
   export async function updateUser(data: UserData) {
     const { user } = await withAuth(); // Works!
     // ...
   }
   ```

4. **Internal Operations** (within your Next.js app)
   - User settings updates
   - Creating/deleting resources
   - Server-side validations

5. **Progressive Enhancement**
   - Forms work without JavaScript
   - Graceful degradation

---

## When to Use API Routes

### ✅ Use API Routes for:

1. **External API Access**
   ```typescript
   // Accessible from mobile apps, external services
   GET /api/quizzes/[id]
   POST /api/sessions
   ```

2. **Webhook Endpoints**
   ```typescript
   // app/api/webhooks/workos/route.ts
   export async function POST(request: NextRequest) {
     // Handle webhook from external service
   }
   ```

3. **Public APIs**
   - Need to expose endpoints publicly
   - Third-party integrations
   - Mobile app backends

4. **Complex HTTP Requirements**
   - Custom headers
   - File uploads/downloads
   - Streaming responses
   - WebSocket upgrades

5. **RESTful API Design**
   - Building a traditional REST API
   - Multiple HTTP methods (GET, POST, PUT, DELETE)
   - Proper status codes and error responses

---

## Examples from This Codebase

### Server Action Example

**File:** `app/(app)/actions/user.ts`
```typescript
'use server';

import { withAuth } from '@workos-inc/authkit-nextjs';
import { db } from '@/lib/db/connection';

export async function updateUser(data: {
  name?: string;
  usertag?: string;
  bio?: string | null;
}) {
  const { user } = await withAuth(); // ✅ Works in Server Actions
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  // Update logic...
  return updatedUser;
}
```

**Usage in Client Component:**
```typescript
// app/(app)/settings/SettingsClient.tsx
const handleSave = async () => {
  try {
    const updated = await updateUser({
      name: user.name,
      usertag: user.usertag,
    }); // ✅ Direct function call
    showToast('Settings saved!', 'success');
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
  }
};
```

**Why Server Action?**
- Internal operation (settings update)
- Requires authentication (withAuth works here)
- Called from Client Component
- Simple data mutation

### API Route Example

**File:** `app/(app)/api/quizzes/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';

export async function GET(request: NextRequest) {
  try {
    const { user } = await withAuth(); // ⚠️ May not work if middleware excludes API routes
    // ...
    return NextResponse.json(quizzes);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**Usage:**
```typescript
// From anywhere (browser, mobile app, external service)
const response = await fetch('/api/quizzes');
const quizzes = await response.json();
```

**Why API Route?**
- Could be accessed externally
- Traditional REST endpoint
- Returns JSON responses

---

## Authentication Considerations

### Server Actions with Authentication

Server Actions work seamlessly with authentication because they run in the server context with access to cookies:

```typescript
'use server';
import { withAuth } from '@workos-inc/authkit-nextjs';

export async function myAction() {
  const { user } = await withAuth(); // ✅ Always works
  // ...
}
```

### API Routes with Authentication

API Routes may require middleware configuration. If your middleware excludes API routes (like in this codebase's `proxy.ts`), `withAuth()` won't work:

```typescript
// proxy.ts
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|...).*)', // ❌ Excludes /api routes
  ],
};
```

**Problem:**
```typescript
// app/api/users/me/route.ts
export async function PATCH(request: NextRequest) {
  const { user } = await withAuth(); // ❌ Error: route not covered by middleware
}
```

**Solution:** Use Server Actions instead, or configure middleware to include API routes.

---

## Error Handling

### Server Actions

```typescript
'use server';

export async function updateUser(data: UserData) {
  try {
    // ...
    return result;
  } catch (error) {
    throw new Error('Failed to update'); // ✅ Throw errors
  }
}

// Client-side
try {
  await updateUser(data);
} catch (error) {
  console.error(error); // ✅ Catch thrown errors
}
```

### API Routes

```typescript
export async function POST(request: NextRequest) {
  try {
    // ...
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed' },
      { status: 500 } // ✅ Return status codes
    );
  }
}

// Client-side
const response = await fetch('/api/users', {
  method: 'POST',
  body: JSON.stringify(data),
});
if (!response.ok) {
  const error = await response.json();
  console.error(error); // ✅ Check response.ok
}
```

---

## Performance Considerations

### Server Actions
- **Lower latency**: No HTTP overhead
- **Automatic optimization**: Next.js handles optimization
- **Smaller bundle**: Functions are tree-shaken
- **Better DX**: Type-safe, direct calls

### API Routes
- **HTTP overhead**: Additional network layer
- **Manual optimization**: You manage caching, etc.
- **Larger bundle**: Need to include fetch logic
- **More boilerplate**: Request/response handling

---

## Migration Example

### Before (API Route) ❌
```typescript
// app/api/users/me/route.ts
export async function PATCH(request: NextRequest) {
  const { user } = await withAuth(); // ❌ Doesn't work with middleware exclusion
  // ...
  return NextResponse.json(updated);
}

// Client
const response = await fetch('/api/users/me', {
  method: 'PATCH',
  body: JSON.stringify(data),
});
const result = await response.json();
```

### After (Server Action) ✅
```typescript
// app/actions/user.ts
'use server';
export async function updateUser(data: UserData) {
  const { user } = await withAuth(); // ✅ Works!
  // ...
  return updated;
}

// Client
const result = await updateUser(data); // ✅ Direct call
```

---

## Best Practices

### Server Actions
1. ✅ Use for internal operations within your app
2. ✅ Use for form submissions
3. ✅ Use when you need authentication (with middleware exclusion)
4. ✅ Keep actions focused and single-purpose
5. ✅ Use TypeScript for type safety
6. ✅ Throw meaningful errors

### API Routes
1. ✅ Use for external API access
2. ✅ Use for webhooks
3. ✅ Use for public endpoints
4. ✅ Return proper HTTP status codes
5. ✅ Follow REST conventions
6. ✅ Handle CORS if needed

---

## Summary

**Server Actions** are the modern, recommended approach for:
- Internal operations
- Form handling
- Data mutations
- When middleware excludes API routes

**API Routes** are better for:
- External access
- Public APIs
- Webhooks
- Complex HTTP requirements

**In this codebase**, Server Actions are preferred for authenticated operations because the middleware excludes API routes, making `withAuth()` unreliable in API routes.

---

## Further Reading

- [Next.js Server Actions Documentation](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Next.js API Routes Documentation](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [React Server Components](https://react.dev/reference/rsc/server-components)
