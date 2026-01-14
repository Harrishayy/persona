# WorkOS User Data Sync Guide

## Overview

This guide explains how to integrate WorkOS AuthKit user data into your own database. **You use BOTH systems together**:
- **WorkOS**: Handles authentication (sign in, sign up, SSO, etc.)
- **Your Database**: Stores application-specific user data and links to WorkOS users

## Two Approaches to Sync Data

### Approach 1: Webhooks (Real-time) ⭐ Recommended

Webhooks provide real-time synchronization when users are created, updated, or deleted in WorkOS.

#### Setup Steps:

1. **Install dependencies** (if using @workos-inc/node for verification):
   ```bash
   npm install @workos-inc/node
   ```
   Or use the manual verification method (already implemented in this codebase).

2. **Set environment variable**:
   ```env
   WORKOS_WEBHOOK_SECRET=your_webhook_secret_from_dashboard
   ```

3. **Configure webhook in WorkOS Dashboard**:
   - Go to [WorkOS Dashboard](https://dashboard.workos.com) → Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/workos`
   - Select events: `user.created`, `user.updated`, `user.deleted`
   - Copy the webhook secret to your `.env` file

4. **The webhook endpoint is already created** at:
   - `app/api/webhooks/workos/route.ts`

#### How it works:
- When a user signs up/updates in WorkOS, it sends a webhook to your endpoint
- Your endpoint verifies the signature and syncs the user to your database
- Responds immediately with 200 OK (best practice)

### Approach 2: Lazy Sync (On-Demand)

Sync users to your database when they first access your app.

#### Usage:

```typescript
import { ensureUserSynced } from '@/lib/utils/user-sync';

export default async function MyPage() {
  const { user } = await withAuth();
  
  if (user) {
    // Sync user to database on first access
    await ensureUserSynced();
  }
  
  // ... rest of your code
}
```

This approach:
- ✅ Simple to implement
- ✅ No webhook setup required
- ✅ Syncs automatically when needed
- ⚠️ Slight delay on first access

## Which Approach to Use?

### Use Webhooks if:
- You need real-time sync
- You have many users
- You want to handle user deletions automatically
- You're building a production app

### Use Lazy Sync if:
- You're prototyping
- You have few users
- You want the simplest setup
- You can tolerate slight delays

### Use Both:
- Webhooks for production (real-time)
- Lazy sync as fallback (handles edge cases)

## Database Schema

Your `users` table links to WorkOS users via the `id` field:

```typescript
{
  id: string,           // WorkOS user ID (primary key)
  email: string,        // From WorkOS
  name: string,         // From WorkOS (firstName + lastName)
  usertag: string,      // Generated from email
  avatarUrl: string,    // From WorkOS
  bio: string,          // Your app-specific data
  details: string,      // Your app-specific data
  createdAt: Date,
  updatedAt: Date,
}
```

## WorkOS User Object

When you call `withAuth()`, you get a WorkOS user object:

```typescript
{
  id: string,
  email: string,
  firstName?: string,
  lastName?: string,
  imageUrl?: string,
  // ... other WorkOS fields
}
```

## Key Points from WorkOS Documentation

1. **You maintain your own database**: WorkOS docs recommend storing user data in your own DB that links to WorkOS users
2. **WorkOS is source of truth for auth**: Use WorkOS for authentication, your DB for application data
3. **Events available**: `user.created`, `user.updated`, `user.deleted`
4. **Best practice**: Respond to webhooks quickly (200 OK), process async

## Testing Webhooks Locally

Use [ngrok](https://ngrok.com) to test webhooks locally:

```bash
ngrok http 3000
# Use the ngrok URL in WorkOS dashboard: https://abc123.ngrok.io/api/webhooks/workos
```

## Security

- ✅ Webhook signature verification (prevents spoofing)
- ✅ IP allowlist (optional, WorkOS IPs are fixed)
- ✅ HTTPS required for webhooks
- ✅ Timestamp validation (prevents replay attacks)

## Troubleshooting

### Webhook not receiving events?
1. Check webhook URL is correct in WorkOS dashboard
2. Verify `WORKOS_WEBHOOK_SECRET` is set correctly
3. Check webhook endpoint is publicly accessible
4. Verify events are enabled in dashboard

### User not syncing?
1. Check webhook logs for errors
2. Verify database connection
3. Check user table schema matches
4. Try lazy sync as fallback

## Next Steps

1. **For production**: Set up webhooks in WorkOS dashboard
2. **For development**: Use lazy sync or ngrok for webhooks
3. **Monitor**: Add logging to track sync operations
4. **Handle edge cases**: Consider what happens if webhook fails

## References

- [WorkOS Events Documentation](https://workos.com/docs/events)
- [WorkOS Webhooks Guide](https://workos.com/docs/events/data-syncing/webhooks)
- [WorkOS Modeling Your App](https://workos.com/docs/user-management/modeling-your-app)
