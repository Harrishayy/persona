import { NextRequest, NextResponse } from 'next/server';
import { syncWorkOSUser, deleteUserByWorkOSId } from '@/lib/db/queries/users';
import crypto from 'crypto';

/**
 * Verifies WorkOS webhook signature manually
 * Based on WorkOS documentation: https://workos.com/docs/events/data-syncing/webhooks
 */
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    // Parse signature header: "t=timestamp,v1=signature"
    const parts = signature.split(',');
    const timestampPart = parts.find(p => p.startsWith('t='));
    const signaturePart = parts.find(p => p.startsWith('v1='));

    if (!timestampPart || !signaturePart) {
      return false;
    }

    const timestamp = timestampPart.split('=')[1];
    const receivedSignature = signaturePart.split('=')[1];

    // Check timestamp is not too old (5 minutes tolerance)
    const eventTime = parseInt(timestamp);
    const currentTime = Date.now();
    const tolerance = 5 * 60 * 1000; // 5 minutes in milliseconds

    if (Math.abs(currentTime - eventTime) > tolerance) {
      return false;
    }

    // Construct expected signature: HMAC SHA256(timestamp + "." + payload)
    const signedPayload = `${timestamp}.${payload}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');

    // Compare signatures using constant-time comparison
    return crypto.timingSafeEqual(
      Buffer.from(receivedSignature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Webhook signature verification error:', error);
    return false;
  }
}

/**
 * Webhook endpoint to receive WorkOS events
 * 
 * This endpoint receives real-time events from WorkOS when users are:
 * - Created (user.created)
 * - Updated (user.updated)  
 * - Deleted (user.deleted)
 * 
 * Setup:
 * 1. Add this URL to WorkOS Dashboard: https://yourdomain.com/api/webhooks/workos
 * 2. Configure which events to receive (user.created, user.updated, user.deleted)
 * 3. Get webhook secret from dashboard and set WORKOS_WEBHOOK_SECRET env var
 * 
 * Best practice: Respond quickly with 200 OK, then process async
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('workos-signature') || request.headers.get('WorkOS-Signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(
      body,
      signature,
      process.env.WORKOS_WEBHOOK_SECRET!
    );

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse event payload
    const event = JSON.parse(body);

    // Handle different event types
    switch (event.event) {
      case 'user.created':
      case 'user.updated': {
        // Sync user data to your database
        const userData = event.data;
        await syncWorkOSUser({
          id: userData.id,
          email: userData.email,
          firstName: userData.firstName || null,
          lastName: userData.lastName || null,
          imageUrl: userData.imageUrl || null,
        });
        break;
      }

      case 'user.deleted': {
        // Remove user from your database
        const userData = event.data;
        await deleteUserByWorkOSId(userData.id);
        break;
      }

      default:
        // Ignore other event types
        console.log(`Unhandled event type: ${event.event}`);
    }

    // Always return 200 OK immediately to acknowledge receipt
    // Process the event asynchronously if needed
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook verification error:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
}
