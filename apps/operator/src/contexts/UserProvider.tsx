import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type BankId = "A" | "B" | "C" | "D" | "E";

export interface User {
  id: number;
  name: string;
  assignedBank: BankId;
}

interface UserContextType {
  user: User;
  setAssignedBank: (bank: BankId) => void;
  availableBanks: BankId[];
}

const STORAGE_KEY = 'pump-iot-user-bank';

const DEFAULT_USER: User = {
  id: 1,
  name: 'Operario 1',
  assignedBank: 'A',
};

const AVAILABLE_BANKS: BankId[] = ['A', 'B', 'C', 'D', 'E'];

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(() => {
    if (typeof window === 'undefined') return DEFAULT_USER;
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return DEFAULT_USER;
      }
    }
    return DEFAULT_USER;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }, [user]);

  const setAssignedBank = useCallback((bank: BankId) => {
    setUser(prev => ({ ...prev, assignedBank: bank }));
  }, []);

  return (
    <UserContext.Provider value={{ user, setAssignedBank, availableBanks: AVAILABLE_BANKS }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
