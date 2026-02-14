
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

export type UserRole = "supervisor" | "operario";

export interface User {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    createdAt: string;
}

// Mock initial data
const INITIAL_USERS: User[] = [
    { id: "1", username: "admin", email: "admin@flowserve.com", role: "supervisor", isActive: true, createdAt: new Date().toISOString() },
    { id: "2", username: "operario1", email: "op1@flowserve.com", role: "operario", isActive: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: "3", username: "operario2", email: "op2@flowserve.com", role: "operario", isActive: false, createdAt: new Date(Date.now() - 172800000).toISOString() },
];

export function useUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    // Load initial data (simulated API)
    useEffect(() => {
        const loadUsers = async () => {
            setLoading(true);
            // Simulate network delay
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Try to get from local storage or use initial
            const stored = localStorage.getItem("mock_users");
            if (stored) {
                setUsers(JSON.parse(stored));
            } else {
                setUsers(INITIAL_USERS);
                localStorage.setItem("mock_users", JSON.stringify(INITIAL_USERS));
            }
            setLoading(false);
        };
        loadUsers();
    }, []);

    // Save to local storage whenever users change
    const saveUsers = (newUsers: User[]) => {
        setUsers(newUsers);
        localStorage.setItem("mock_users", JSON.stringify(newUsers));
    };

    const addUser = useCallback(async (user: Omit<User, "id" | "createdAt">) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 300));

        const newUser: User = {
            ...user,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
        };

        saveUsers([...users, newUser]);
        toast.success("Usuario creado correctamente");
        return newUser;
    }, [users]);

    const updateUser = useCallback(async (id: string, data: Partial<Omit<User, "id" | "createdAt">>) => {
        await new Promise((resolve) => setTimeout(resolve, 300));

        const newUsers = users.map((u) => (u.id === id ? { ...u, ...data } : u));
        saveUsers(newUsers);
        toast.success("Usuario actualizado correctamente");
    }, [users]);

    const deleteUser = useCallback(async (id: string) => {
        await new Promise((resolve) => setTimeout(resolve, 300));

        const newUsers = users.filter((u) => u.id !== id);
        saveUsers(newUsers);
        toast.success("Usuario eliminado correctamente");
    }, [users]);

    return {
        users,
        loading,
        addUser,
        updateUser,
        deleteUser,
    };
}
