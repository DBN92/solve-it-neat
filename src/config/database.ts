// Configuração da Base de Dados
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
}

// Configuração para diferentes ambientes
export const databaseConfig: DatabaseConfig = {
  host: import.meta.env.VITE_DB_HOST || 'localhost',
  port: parseInt(import.meta.env.VITE_DB_PORT || '5432'),
  database: import.meta.env.VITE_DB_NAME || 'consent_management',
  username: import.meta.env.VITE_DB_USER || 'postgres',
  password: import.meta.env.VITE_DB_PASSWORD || 'password',
  ssl: import.meta.env.VITE_NODE_ENV === 'production'
};

// Configuração para localStorage (simulação de base de dados local)
export const LOCAL_STORAGE_KEYS = {
  USERS: 'consent_app_users',
  CONSENTS: 'consent_app_consents',
  APPLICANTS: 'consent_app_applicants',
  AUTH_USER: 'consent_app_auth_user'
};

// Configuração da API
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  TIMEOUT: 10000,
  ENDPOINTS: {
    AUTH: '/auth',
    USERS: '/users',
    CONSENTS: '/consents',
    APPLICANTS: '/applicants'
  }
};