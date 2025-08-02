import { prisma } from "../db/db";
import { v4 as uuidv4 } from "uuid";
import { config } from "../../server.config";


export const hashPassword = async (password: string): Promise<string> => {
  return Bun.password.hash(password);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return Bun.password.verify(password, hashedPassword);
};

export interface SignupData {
  email: string;
  password: string;
  name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResult {
  user: any;
  sessionToken: string;
}

export const signup = async (data: SignupData): Promise<AuthResult> => {
  const { email, password, name } = data;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create new user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      onboarding: "SIGNUP",
    },
    include: { tasteProfile: true },
  });

  // Create session
  const sessionToken = await createSession(user.id);

  return { user, sessionToken };
};

export const login = async (data: LoginData): Promise<AuthResult> => {
  const { email, password } = data;

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
    include: { tasteProfile: true },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Check if user has password (not Google-only user)
  if (!user.password) {
    throw new Error("This account was created with Google. Please use Google sign-in.");
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
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
        include: { tasteProfile: true },
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
    include: { tasteProfile: true },
  });

  return updatedUser;
};
