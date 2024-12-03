import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (email: string, password: string) => void;
  logout: () => void;
  addUser: (user: User) => void;
  removeUser: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_USERS: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'admin' },
  { id: '2', name: 'Prof. Smith', email: 'teacher@example.com', role: 'teacher' },
  { id: '3', name: 'John Doe', email: 'student@example.com', role: 'student' },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const stored = localStorage.getItem('users');
    return stored ? JSON.parse(stored) : DEMO_USERS;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  const login = (email: string, password: string) => {
    const foundUser = users.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    setUser(null);
  };

  const addUser = (newUser: User) => {
    setUsers([...users, newUser]);
  };

  const removeUser = (userId: string) => {
    if (userId === user?.id) {
      alert('Cannot delete your own account');
      return;
    }
    setUsers(users.filter(u => u.id !== userId));
  };

  return (
    <AuthContext.Provider value={{ user, users, login, logout, addUser, removeUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}