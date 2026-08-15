import { db } from './index.ts';
import { users } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(
  uid: string,
  email: string,
  displayName?: string | null,
  photoURL?: string | null
) {
  try {
    const existing = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    if (existing.length > 0) {
      // Update display name or photo if changed
      const updated = await db.update(users)
        .set({
          email,
          displayName: displayName || existing[0].displayName,
          photoURL: photoURL || existing[0].photoURL,
          updatedAt: new Date(),
        })
        .where(eq(users.uid, uid))
        .returning();
      return updated[0];
    }

    const inserted = await db.insert(users)
      .values({
        uid,
        email,
        displayName: displayName || null,
        photoURL: photoURL || null,
        currency: '$',
      })
      .returning();

    return inserted[0];
  } catch (error) {
    console.error('Error in getOrCreateUser:', error);
    throw new Error('Database operation failed while synchronizing user.', { cause: error });
  }
}
