export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  role: string;
  createdAt: string;
}

export interface UserPublic {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}