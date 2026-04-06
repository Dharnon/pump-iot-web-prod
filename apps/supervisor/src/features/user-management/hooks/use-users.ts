"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

import type { User } from "@/features/user-management/types";

const INITIAL_USERS: User[] = [
  {
    id: "1",
    username: "admin",
    email: "admin@flowserve.com",
    role: "supervisor",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    username: "operario1",
    email: "op1@flowserve.com",
    role: "operario",
    isActive: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "3",
    username: "operario2",
    email: "op2@flowserve.com",
    role: "operario",
    isActive: false,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

const STORAGE_KEY = "mock_users";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUsers(JSON.parse(stored) as User[]);
      } else {
        setUsers(INITIAL_USERS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_USERS));
      }

      setLoading(false);
    };

    void loadUsers();
  }, []);

  const saveUsers = (newUsers: User[]) => {
    setUsers(newUsers);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUsers));
  };

  const addUser = useCallback(
    async (user: Omit<User, "id" | "createdAt">) => {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const newUser: User = {
        ...user,
        id: Math.random().toString(36).slice(2, 11),
        createdAt: new Date().toISOString(),
      };

      saveUsers([...users, newUser]);
      toast.success("Usuario creado correctamente");
      return newUser;
    },
    [users],
  );

  const updateUser = useCallback(
    async (id: string, data: Partial<Omit<User, "id" | "createdAt">>) => {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const newUsers = users.map((u) => (u.id === id ? { ...u, ...data } : u));
      saveUsers(newUsers);
      toast.success("Usuario actualizado correctamente");
    },
    [users],
  );

  const deleteUser = useCallback(
    async (id: string) => {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const newUsers = users.filter((u) => u.id !== id);
      saveUsers(newUsers);
      toast.success("Usuario eliminado correctamente");
    },
    [users],
  );

  return {
    users,
    loading,
    addUser,
    updateUser,
    deleteUser,
  };
}

