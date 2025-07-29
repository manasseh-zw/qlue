import { OAuth2Client } from "google-auth-library";
import { prisma } from "../db/db";
import { v4 as uuidv4 } from "uuid";
import { config } from "../../server.config";

const googleClient = new OAuth2Client(
  config.auth.google.clientId,
  config.auth.google.clientSecret,
  `${config.auth.url}/api/auth/google/callback`
);

export interface GoogleUserInfo {
  sub: string; // Google ID
  email: string;
  name: string;
  picture: string;
}

export interface AuthResult {
  user: any;
  sessionToken: string;
}

// Generate Google OAuth URL
export const getGoogleAuthUrl = (): string => {
  const authUrl = googleClient.generateAuthUrl({
    access_type: "offline",
    scope: ["profile", "email"],
    prompt: "consent",
  });
  return authUrl;
};

// Exchange authorization code for user info
export const handleGoogleCallback = async (
  code: string
): Promise<AuthResult> => {
  try {
    // Get tokens from Google
    const { tokens } = await googleClient.getToken(code);
    googleClient.setCredentials(tokens);

    // Get user info from Google
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token!,
      audience: config.auth.google.clientId,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error("No payload from Google");
    }

    const googleUserInfo: GoogleUserInfo = {
      sub: payload.sub,
      email: payload.email!,
      name: payload.name!,
      picture: payload.picture!,
    };

    // Find or create user in our database
    let user = await prisma.user.findUnique({
      where: { googleId: googleUserInfo.sub },
      include: { tasteProfile: true },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          googleId: googleUserInfo.sub,
          email: googleUserInfo.email,
          name: googleUserInfo.name,
          image: googleUserInfo.picture,
          onboarding: "SIGNUP",
        },
        include: { tasteProfile: true },
      });
    } else {
      // Update existing user info
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: googleUserInfo.name,
          image: googleUserInfo.picture,
        },
        include: { tasteProfile: true },
      });
    }

    // Create session
    const sessionToken = await createSession(user.id);

    return { user, sessionToken };
  } catch (error) {
    console.error("Google OAuth error:", error);
    throw new Error("Authentication failed");
  }
};

// Create session for user
export const createSession = async (userId: string): Promise<string> => {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  return token;
};

// Get user from session token
export const getUserFromSession = async (
  token: string
): Promise<any | null> => {
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        include: {
          tasteProfile: true,
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    // Clean up expired session
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
    return null;
  }

  return session.user;
};

// Delete session (logout)
export const deleteSession = async (token: string): Promise<void> => {
  await prisma.session
    .delete({
      where: { token },
    })
    .catch(() => {
      // Ignore if session doesn't exist
    });
};

// Update user data
export const updateUser = async (userId: string, data: any) => {
  return await prisma.user.update({
    where: { id: userId },
    data,
    include: { tasteProfile: true },
  });
};
