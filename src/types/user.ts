export type UserRole = 'superAdm' | 'comercial' | 'suporte' | 'data_owner';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  role: UserRole;
  password: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: UserRole;
  active?: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  login: (credentials: LoginRequest) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Definição de permissões por role
export const ROLE_PERMISSIONS = {
  superAdm: ['dashboard', 'nova-manifestacao', 'consentimentos', 'meus-dados', 'relatorios', 'requerentes', 'usuarios'],
  comercial: ['dashboard', 'nova-manifestacao', 'consentimentos', 'requerentes'],
  suporte: ['nova-manifestacao', 'consentimentos'],
  data_owner: ['meus-dados'] // Donos de dados só podem ver e gerenciar seus próprios consentimentos
} as const;

export type TabPermission = 'dashboard' | 'nova-manifestacao' | 'consentimentos' | 'meus-dados' | 'relatorios' | 'requerentes' | 'usuarios';