import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/connection';
import { quizSessions, participants } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { userName } = body;

    if (!userName || !userName.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const session = await db.query.quizSessions.findFirst({
      where: eq(quizSessions.code, code),
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.status === 'finished') {
      return NextResponse.json({ error: 'Session has ended' }, { status: 400 });
    }

    // Generate or get player ID
    const cookieStore = await cookies();
    let playerId = cookieStore.get(`quiz_player_${code}`)?.value;
    
    if (!playerId) {
      playerId = `guest_${randomUUID()}`;
      // Set cookie for this player
      cookieStore.set(`quiz_player_${code}`, playerId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
      });
    }

    // Check if already joined
    const existing = await db.query.participants.findFirst({
      where: (participants, { and, eq }) => and(
        eq(participants.sessionId, session.id),
        eq(participants.userId, playerId)
      ),
    });

    if (existing) {
      return NextResponse.json({ ...existing, playerId });
    }

    // Create participant
    const [participant] = await db.insert(participants).values({
      sessionId: session.id,
      userId: playerId,
      userName: userName.trim(),
    }).returning();

    return NextResponse.json({ ...participant, playerId }, { status: 201 });
  } catch (error) {
    console.error('Error joining session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
