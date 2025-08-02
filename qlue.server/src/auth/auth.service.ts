import { prisma } from "../db/db";
import { v4 as uuidv4 } from "uuid";
import { config } from "../../server.config";
import { authResponse, loginRequest, signupRequest } from "./types";

export const signup = async (data: signupRequest): Promise<authResponse> => {
  const { email, password, name } = data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) throw new Error("User with this email already exists");

  if (password.length < 8)
    throw new Error("Password must be at least 8 characters long");

  const hashedPassword = await Bun.password.hash(password);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      onboarding: "SIGNUP",
    },
    include: { tasteProfile: false },
  });

  const sessionToken = await createSession(user.id);

  return { user, sessionToken };
};

export const login = async (data: loginRequest): Promise<authResponse> => {
  const { email, password } = data;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { tasteProfile: false },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }
  // Check if user has password (not Google-only user)
  if (!user.password) {
    throw new Error("Invalid email or password");
  }

  // Verify password
  const isPasswordValid = await Bun.password.verify(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid Credentials");
  }

  // Create session
  const sessionToken = await createSession(user.id);

  return { user, sessionToken };
};

// Create session for user
export const createSession = async (userId: string): Promise<string> => {
  const sessionToken = uuidv4();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await prisma.session.create({
    data: {
      userId,
      token: sessionToken,
      expiresAt,
    },
  });

  return sessionToken;
};

// Get user from session token
export const getUserFromSession = async (sessionToken: string) => {
  if (!sessionToken) return null;

  const session = await prisma.session.findUnique({
    where: { token: sessionToken },
    include: {
      user: {
        include: { tasteProfile: false },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session.user;
};

export const deleteSession = async (sessionToken: string): Promise<void> => {
  await prisma.session.deleteMany({
    where: { token: sessionToken },
  });
};

export const updateUser = async (userId: string, updateData: any) => {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    include: { tasteProfile: false },
  });

  return updatedUser;
};
