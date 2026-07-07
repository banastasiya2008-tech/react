export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  createdAt: string;
}

export interface UserPublic {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}