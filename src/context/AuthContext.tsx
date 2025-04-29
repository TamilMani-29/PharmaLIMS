import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: any) => Promise<void>;
  checkAuth: () => void;
  registeredUsers: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial demo user
const DEMO_USER = {
  email: 'demo@example.com',
  password: 'password',
  name: 'Demo User',
  role: 'Lab Manager'
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState<(User & { password: string })[]>([DEMO_USER]);

  // Check if user is already logged in
  const checkAuth = () => {
    setLoading(true);
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        // Validate user object has required properties
        if (parsedUser?.email && parsedUser?.name && parsedUser?.role) {
          setUser(parsedUser);
          setIsAuthenticated(true);
        } else {
          throw new Error('Invalid user data');
        }
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      localStorage.removeItem('user'); // Clear invalid data
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error('Please enter both email and password');
    }

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user exists in our registered users
      const foundUser = registeredUsers.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      
      if (!foundUser) {
        throw new Error('Invalid email or password');
      }

      // Validate user has required properties
      if (!foundUser.email || !foundUser.name || !foundUser.role) {
        throw new Error('Invalid user data');
      }
      
      // Create user object without password
      const userToStore = { 
        email: foundUser.email, 
        name: foundUser.name, 
        role: foundUser.role 
      };
      
      localStorage.setItem('user', JSON.stringify(userToStore));
      setUser(userToStore);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const register = async (userData: { 
    email: string; 
    password: string; 
    name: string; 
    role: string;
    department?: string;
  }) => {
    if (!userData.email || !userData.password || !userData.name || !userData.role) {
      throw new Error('Please fill in all required fields');
    }

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists
      if (registeredUsers.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
        throw new Error('User with this email already exists');
      }
      
      // Add user to registered users
      setRegisteredUsers(prev => [...prev, userData]);
      console.log('User registered:', userData);
      // We don't automatically log them in after registration
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      login,
      logout,
      register,
      checkAuth,
      registeredUsers
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}