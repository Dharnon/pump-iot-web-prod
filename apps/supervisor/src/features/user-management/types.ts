export type UserRole = "supervisor" | "operario";

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface UserFormData {
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  password: string;
}

