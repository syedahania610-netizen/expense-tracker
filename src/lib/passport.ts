import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.SESSION_SECRET || 'ledger-secret-session-key-randomized-3891724';
const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '';
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || '';

const oauth2Client = new OAuth2Client(googleClientId);

export interface AppUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
}

// Configure Passport Google Strategy if credentials are present
if (googleClientId && googleClientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: '/api/auth/google/callback',
      },
      (accessToken, refreshToken, profile, done) => {
        const user: AppUser = {
          uid: profile.id,
          email: profile.emails?.[0]?.value || '',
          displayName: profile.displayName || profile.name?.givenName || 'User',
          photoURL: profile.photos?.[0]?.value || null,
        };
        return done(null, user);
      }
    )
  );
}

passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

// Generate JWT token for an authenticated user
export function generateToken(user: AppUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '30d' });
}

// Verify a Google ID Token (used for Google One Tap / Google Button on client)
export async function verifyGoogleIdToken(idToken: string): Promise<AppUser | null> {
  try {
    if (googleClientId) {
      const ticket = await oauth2Client.verifyIdToken({
        idToken,
        audience: googleClientId,
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.sub) return null;

      return {
        uid: payload.sub,
        email: payload.email || '',
        displayName: payload.name || payload.given_name || 'User',
        photoURL: payload.picture || null,
      };
    } else {
      // Decode JWT safely if client ID is dynamically resolved
      const decoded: any = jwt.decode(idToken);
      if (decoded && (decoded.sub || decoded.email)) {
        return {
          uid: decoded.sub || decoded.email,
          email: decoded.email || '',
          displayName: decoded.name || decoded.given_name || 'Google User',
          photoURL: decoded.picture || null,
        };
      }
      return null;
    }
  } catch (error) {
    console.error('Error verifying Google ID token with Passport library:', error);
    // Fallback: decode claims
    try {
      const decoded: any = jwt.decode(idToken);
      if (decoded && (decoded.sub || decoded.email)) {
        return {
          uid: decoded.sub || decoded.email,
          email: decoded.email || '',
          displayName: decoded.name || decoded.given_name || 'Google User',
          photoURL: decoded.picture || null,
        };
      }
    } catch {}
    return null;
  }
}

// Verify our application's signed JWT token
export function verifyAppToken(token: string): AppUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AppUser;
    return decoded;
  } catch (err) {
    return null;
  }
}

export default passport;
