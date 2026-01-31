// Auth types for Better Auth integration

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  user: User;
  token: string;
  expiresAt: string;
}

export interface AuthError {
  message: string;
  code: string;
}
