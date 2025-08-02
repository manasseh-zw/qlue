import { User } from "@prisma/client";

export type signupRequest = {
  email: string;
  password: string;
  name?: string;
};

export type loginRequest = {
  email: string;
  password: string;
};

export type authResponse =  {
  user: User;
  sessionToken: string;
}
