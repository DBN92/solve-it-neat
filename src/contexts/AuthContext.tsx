import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/user';
import { db } from '@/services/database';
import { LOCAL_STORAGE_KEYS } from '@/config/database';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const loadUser = async () => {
      try {
        const savedUserId = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_USER);
        if (savedUserId) {
          const foundUser = await db.users.getUserById(savedUserId);
          if (foundUser && foundUser.active) {
            setUser(foundUser);
          } else {
            // Remove invalid user from localStorage
            localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_USER);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_USER);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    console.log('🔐 Tentativa de login com email:', email);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user by email (password validation would be done on backend)
      console.log('🔍 Buscando usuário por email...');
      const foundUser = await db.users.getUserByEmail(email);
      console.log('👤 Usuário encontrado:', foundUser);
      
      if (foundUser && foundUser.active) {
        console.log('✅ Login bem-sucedido para:', foundUser.name);
        setUser(foundUser);
        localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_USER, foundUser.id);
        setIsLoading(false);
        return true;
      }
      
      console.log('❌ Login falhou - usuário não encontrado ou inativo');
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('💥 Erro no login:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_USER);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

// Hook para verificar permissões
export function usePermissions() {
  const { user } = useAuth();
  
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    const rolePermissions = {
      superAdm: ['dashboard', 'new-request', 'consents', 'data-owner', 'reports', 'applicant', 'users'],
      comercial: ['dashboard', 'new-request', 'consents', 'applicant'],
      suporte: ['new-request', 'consents']
    };

    return rolePermissions[user.role]?.includes(permission) || false;
  };

  const getAvailableTabs = () => {
    if (!user) return [];
    
    const allTabs = [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'new-request', label: 'Nova Manifestação' },
      { id: 'consents', label: 'Consentimentos' },
      { id: 'data-owner', label: 'Meus Dados' },
      { id: 'reports', label: 'Relatórios' },
      { id: 'applicant', label: 'Solicitante' },
      { id: 'users', label: 'Usuários' }
    ];

    return allTabs.filter(tab => hasPermission(tab.id));
  };

  return {
    hasPermission,
    getAvailableTabs,
    userRole: user?.role
  };
}