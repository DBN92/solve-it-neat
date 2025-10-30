import { LOCAL_STORAGE_KEYS, API_CONFIG } from '@/config/database';
import { User, CreateUserRequest, UpdateUserRequest, UserRole } from '@/types/user';
import { ConsentRequest, Applicant } from '@/pages/Index';
import { consentService, userService, testConnection } from './supabaseService';
import { supabase } from '@/lib/supabase';

// Classe para gerenciar a base de dados local (localStorage)
class LocalDatabaseService {
  // Métodos para Usuários
  async getUsers(): Promise<User[]> {
    const users = localStorage.getItem(LOCAL_STORAGE_KEYS.USERS);
    return users ? JSON.parse(users, this.dateReviver.bind(this)) : this.getDefaultUsers();
  }

  async getUserById(id: string): Promise<User | null> {
    const users = await this.getUsers();
    return users.find(user => user.id === id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const users = await this.getUsers();
    return users.find(user => user.email === email) || null;
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    const users = await this.getUsers();
    const newUser: User = {
      id: Date.now().toString(),
      ...userData,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    users.push(newUser);
    localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify(users));
    return newUser;
  }

  async updateUser(id: string, userData: UpdateUserRequest): Promise<User | null> {
    const users = await this.getUsers();
    const userIndex = users.findIndex(user => user.id === id);
    
    if (userIndex === -1) return null;
    
    users[userIndex] = {
      ...users[userIndex],
      ...userData,
      updatedAt: new Date()
    };
    
    localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify(users));
    return users[userIndex];
  }

  async deleteUser(id: string): Promise<boolean> {
    const users = await this.getUsers();
    const filteredUsers = users.filter(user => user.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify(filteredUsers));
    return filteredUsers.length < users.length;
  }

  // Métodos para Consentimentos
  async getConsents(): Promise<ConsentRequest[]> {
    const consents = localStorage.getItem(LOCAL_STORAGE_KEYS.CONSENTS);
    return consents ? JSON.parse(consents, this.dateReviver) : this.getDefaultConsents();
  }

  async getConsentsByCpf(cpf: string): Promise<ConsentRequest[]> {
    const allConsents = await this.getConsents();
    return allConsents.filter(consent => consent.cpf === cpf);
  }

  async createConsent(consentData: Omit<ConsentRequest, 'id' | 'createdAt' | 'lastModified'>): Promise<ConsentRequest> {
    const consents = await this.getConsents();
    const newConsent: ConsentRequest = {
      id: Date.now().toString(),
      ...consentData,
      createdAt: new Date(),
      lastModified: new Date()
    };
    
    consents.push(newConsent);
    localStorage.setItem(LOCAL_STORAGE_KEYS.CONSENTS, JSON.stringify(consents));
    return newConsent;
  }

  async updateConsent(id: string, consentData: Partial<ConsentRequest>): Promise<ConsentRequest | null> {
    const consents = await this.getConsents();
    const consentIndex = consents.findIndex(consent => consent.id === id);
    
    if (consentIndex === -1) return null;
    
    consents[consentIndex] = {
      ...consents[consentIndex],
      ...consentData,
      lastModified: new Date()
    };
    
    localStorage.setItem(LOCAL_STORAGE_KEYS.CONSENTS, JSON.stringify(consents));
    return consents[consentIndex];
  }

  // Métodos para Applicants
  async getApplicants(): Promise<Applicant[]> {
    const applicants = localStorage.getItem(LOCAL_STORAGE_KEYS.APPLICANTS);
    return applicants ? JSON.parse(applicants, this.dateReviver.bind(this)) : this.getDefaultApplicants();
  }

  async createApplicant(applicantData: Omit<Applicant, 'id' | 'createdAt'>): Promise<Applicant> {
    const applicants = await this.getApplicants();
    const newApplicant: Applicant = {
      id: Date.now().toString(),
      ...applicantData,
      createdAt: new Date()
    };
    
    applicants.push(newApplicant);
    localStorage.setItem(LOCAL_STORAGE_KEYS.APPLICANTS, JSON.stringify(applicants));
    return newApplicant;
  }

  async updateApplicant(id: string, applicantData: Partial<Applicant>): Promise<Applicant | null> {
    const applicants = await this.getApplicants();
    const applicantIndex = applicants.findIndex(applicant => applicant.id === id);
    
    if (applicantIndex === -1) return null;
    
    applicants[applicantIndex] = {
      ...applicants[applicantIndex],
      ...applicantData
    };
    
    localStorage.setItem(LOCAL_STORAGE_KEYS.APPLICANTS, JSON.stringify(applicants));
    return applicants[applicantIndex];
  }

  private dateReviver(key: string, value: any) {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      return new Date(value);
    }
    return value;
  }

  private getDefaultUsers(): User[] {
    return [
      {
        id: '1',
        name: 'Administrador',
        email: 'admin@lgpd-system.com',
        role: 'superAdm',
        active: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: '2',
        name: 'João da Silva Santos',
        email: 'joao@email.com',
        role: 'comercial',
        active: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '3',
        name: 'Maria Oliveira',
        email: 'maria@email.com',
        role: 'suporte',
        active: true,
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20')
      }
    ];
  }

  private getDefaultConsents(): ConsentRequest[] {
    return [
      // Consentimentos para CPF 12345678900 (João Silva - login automático)
      {
        id: 'consent-auto-1',
        dataUser: 'Banco Central do Brasil',
        dataUserType: 'Instituição Financeira',
        dataOwner: 'João Silva - CPF 123.456.789-00',
        cpf: '12345678900',
        dataTypes: ['CPF', 'Nome completo', 'Dados bancários'],
        purpose: 'Consulta ao Sistema de Informações de Crédito (SCR)',
        legalBasis: 'Consentimento do titular (Art. 7º, I, LGPD)',
        deadline: '2024-12-31',
        controller: 'Banco Central do Brasil',
        status: 'approved',
        createdAt: new Date('2024-01-10T08:00:00Z'),
        approvedAt: new Date('2024-01-10T08:30:00Z'),
        lastModified: new Date('2024-01-10T08:30:00Z'),
        scopes: ['bcb:scr:read', 'bcb:cpf:read'],
        tokenId: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwMCIsInNjb3BlcyI6WyJiY2I6c2NyOnJlYWQiLCJiY2I6Y3BmOnJlYWQiXX0',
        actionHistory: [
          {
            id: 'action-auto-1',
            action: 'created',
            timestamp: new Date('2024-01-10T08:00:00Z'),
            performedBy: 'system',
            reason: 'Solicitação de consentimento criada'
          },
          {
            id: 'action-auto-2',
            action: 'approved',
            timestamp: new Date('2024-01-10T08:30:00Z'),
            performedBy: 'user',
            reason: 'Aprovado pelo titular dos dados'
          }
        ]
      },
      {
        id: 'consent-auto-2',
        dataUser: 'DETRAN-SP',
        dataUserType: 'Órgão Público',
        dataOwner: 'João Silva - CPF 123.456.789-00',
        cpf: '12345678900',
        dataTypes: ['CNH', 'Veículos', 'Multas', 'Pontuação'],
        purpose: 'Consulta de dados veiculares para renovação de CNH',
        legalBasis: 'Exercício regular de direitos (Art. 7º, VI, LGPD)',
        deadline: '2024-06-30',
        controller: 'DETRAN-SP',
        status: 'approved',
        createdAt: new Date('2024-01-12T14:00:00Z'),
        approvedAt: new Date('2024-01-12T14:15:00Z'),
        lastModified: new Date('2024-01-12T14:15:00Z'),
        scopes: ['detran:cnh:read', 'detran:veiculos:read', 'detran:multas:read', 'detran:pontuacao:read'],
        tokenId: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwMCIsInNjb3BlcyI6WyJkZXRyYW46Y25oOnJlYWQiLCJkZXRyYW46dmVpY3Vsb3M6cmVhZCIsImRldHJhbjptdWx0YXM6cmVhZCIsImRldHJhbjpwb250dWFjYW86cmVhZCJdfQ',
        actionHistory: [
          {
            id: 'action-auto-3',
            action: 'created',
            timestamp: new Date('2024-01-12T14:00:00Z'),
            performedBy: 'system',
            reason: 'Solicitação de consentimento criada'
          },
          {
            id: 'action-auto-4',
            action: 'approved',
            timestamp: new Date('2024-01-12T14:15:00Z'),
            performedBy: 'user',
            reason: 'Aprovado pelo titular dos dados'
          }
        ]
      },
      {
        id: 'consent-auto-3',
        dataUser: 'Nubank S.A.',
        dataUserType: 'Instituição Financeira',
        dataOwner: 'João Silva - CPF 123.456.789-00',
        cpf: '12345678900',
        dataTypes: ['CPF', 'Nome completo', 'Renda', 'Histórico de crédito'],
        purpose: 'Análise de crédito para cartão de crédito',
        legalBasis: 'Consentimento do titular (Art. 7º, I, LGPD)',
        deadline: '2024-12-31',
        controller: 'Nu Pagamentos S.A.',
        status: 'pending',
        createdAt: new Date('2024-01-15T10:30:00Z'),
        lastModified: new Date('2024-01-15T10:30:00Z'),
        actionHistory: [
          {
            id: 'action-auto-5',
            action: 'created',
            timestamp: new Date('2024-01-15T10:30:00Z'),
            performedBy: 'system',
            reason: 'Solicitação de consentimento criada'
          }
        ]
      },
      {
        id: 'consent-auto-4',
        dataUser: 'Seguradora Porto Seguro',
        dataUserType: 'Seguradora',
        dataOwner: 'João Silva - CPF 123.456.789-00',
        cpf: '12345678900',
        dataTypes: ['CNH', 'Veículos', 'Multas', 'Histórico de sinistros'],
        purpose: 'Cálculo de prêmio para seguro auto',
        legalBasis: 'Consentimento do titular (Art. 7º, I, LGPD)',
        deadline: '2024-08-31',
        controller: 'Porto Seguro Companhia de Seguros Gerais',
        status: 'rejected',
        createdAt: new Date('2024-01-08T16:00:00Z'),
        rejectedAt: new Date('2024-01-09T09:30:00Z'),
        lastModified: new Date('2024-01-09T09:30:00Z'),
        actionHistory: [
          {
            id: 'action-auto-6',
            action: 'created',
            timestamp: new Date('2024-01-08T16:00:00Z'),
            performedBy: 'system',
            reason: 'Solicitação de consentimento criada'
          },
          {
            id: 'action-auto-7',
            action: 'rejected',
            timestamp: new Date('2024-01-09T09:30:00Z'),
            performedBy: 'user',
            reason: 'Rejeitado pelo titular - não deseja contratar seguro no momento'
          }
        ]
      },
      {
        id: 'consent-auto-5',
        dataUser: 'Uber do Brasil',
        dataUserType: 'Plataforma Digital',
        dataOwner: 'João Silva - CPF 123.456.789-00',
        cpf: '12345678900',
        dataTypes: ['CNH', 'Pontuação', 'Antecedentes criminais'],
        purpose: 'Verificação de habilitação para motorista parceiro',
        legalBasis: 'Consentimento do titular (Art. 7º, I, LGPD)',
        deadline: '2024-12-31',
        controller: 'Uber do Brasil Tecnologia Ltda.',
        status: 'pending',
        createdAt: new Date('2024-01-16T11:00:00Z'),
        lastModified: new Date('2024-01-16T11:00:00Z'),
        actionHistory: [
          {
            id: 'action-auto-8',
            action: 'created',
            timestamp: new Date('2024-01-16T11:00:00Z'),
            performedBy: 'system',
            reason: 'Solicitação de consentimento criada'
          }
        ]
      },
      // Consentimentos originais para outros CPFs
      {
        id: 'consent-govbr-1',
        dataUser: 'Banco do Brasil',
        dataUserType: 'Instituição Financeira',
        dataOwner: 'João Silva Santos',
        cpf: '123.456.789-00',
        dataTypes: ['CNH', 'Veículos'],
        purpose: 'Verificação de dados para abertura de conta corrente',
        legalBasis: 'Consentimento do titular',
        deadline: '2024-12-31',
        controller: 'Banco do Brasil S.A.',
        status: 'pending',
        createdAt: new Date('2024-01-15T10:00:00Z'),
        lastModified: new Date('2024-01-15T10:00:00Z'),
        actionHistory: [
          {
            id: 'action-1',
            action: 'created',
            timestamp: new Date('2024-01-15T10:00:00Z'),
            performedBy: 'system',
            reason: 'Solicitação de consentimento criada'
          }
        ]
      },
      {
        id: 'consent-govbr-2',
        dataUser: 'Seguradora XYZ',
        dataUserType: 'Seguradora',
        dataOwner: 'João Silva Santos',
        cpf: '123.456.789-00',
        dataTypes: ['CNH', 'Multas', 'Pontuação'],
        purpose: 'Cálculo de prêmio de seguro veicular',
        legalBasis: 'Consentimento do titular',
        deadline: '2024-06-30',
        controller: 'Seguradora XYZ Ltda.',
        status: 'approved',
        createdAt: new Date('2024-01-10T14:30:00Z'),
        approvedAt: new Date('2024-01-12T09:15:00Z'),
        lastModified: new Date('2024-01-12T09:15:00Z'),
        scopes: ['senatran:cnh:read', 'senatran:multas:read', 'senatran:pontuacao:read'],
        tokenId: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMuNDU2Ljc4OS0wMCIsInNjb3BlcyI6WyJzZW5hdHJhbjpjbmg6cmVhZCIsInNlbmF0cmFuOm11bHRhczpyZWFkIiwic2VuYXRyYW46cG9udHVhY2FvOnJlYWQiXX0',
        actionHistory: [
          {
            id: 'action-2',
            action: 'created',
            timestamp: new Date('2024-01-10T14:30:00Z'),
            performedBy: 'system',
            reason: 'Solicitação de consentimento criada'
          },
          {
            id: 'action-3',
            action: 'approved',
            timestamp: new Date('2024-01-12T09:15:00Z'),
            performedBy: 'user',
            reason: 'Aprovado pelo titular dos dados'
          }
        ]
      },
      {
        id: 'consent-govbr-3',
        dataUser: 'Financeira ABC',
        dataUserType: 'Instituição Financeira',
        dataOwner: 'João Silva Santos',
        cpf: '123.456.789-00',
        dataTypes: ['Veículos', 'Multas'],
        purpose: 'Análise de crédito para financiamento veicular',
        legalBasis: 'Consentimento do titular',
        deadline: '2024-03-15',
        controller: 'Financeira ABC S.A.',
        status: 'rejected',
        createdAt: new Date('2024-01-08T16:45:00Z'),
        rejectedAt: new Date('2024-01-09T11:20:00Z'),
        lastModified: new Date('2024-01-09T11:20:00Z'),
        actionHistory: [
          {
            id: 'action-4',
            action: 'created',
            timestamp: new Date('2024-01-08T16:45:00Z'),
            performedBy: 'system',
            reason: 'Solicitação de consentimento criada'
          },
          {
            id: 'action-5',
            action: 'rejected',
            timestamp: new Date('2024-01-09T11:20:00Z'),
            performedBy: 'user',
            reason: 'Rejeitado pelo titular dos dados'
          }
        ]
      },
      {
        id: 'consent-govbr-4',
        dataUser: 'Locadora de Veículos DEF',
        dataUserType: 'Locadora',
        dataOwner: 'João Silva Santos',
        cpf: '123.456.789-00',
        dataTypes: ['CNH', 'Pontuação'],
        purpose: 'Verificação de habilitação para locação de veículo',
        legalBasis: 'Consentimento do titular',
        deadline: '2024-02-28',
        controller: 'Locadora DEF Ltda.',
        status: 'pending',
        createdAt: new Date('2024-01-20T08:30:00Z'),
        lastModified: new Date('2024-01-20T08:30:00Z'),
        actionHistory: [
          {
            id: 'action-6',
            action: 'created',
            timestamp: new Date('2024-01-20T08:30:00Z'),
            performedBy: 'system',
            reason: 'Solicitação de consentimento criada'
          }
        ]
      }
    ];
  }

  private getDefaultApplicants(): Applicant[] {
    return [];
  }

  // Métodos utilitários
  async clearAllData(): Promise<void> {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USERS);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.CONSENTS);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.APPLICANTS);
  }

  // Métodos de exportação/importação
  async exportData(): Promise<{users: User[], consents: ConsentRequest[], applicants: Applicant[]}> {
    const users = await this.getUsers();
    const consents = await this.getConsents();
    const applicants = await this.getApplicants();
    return { users, consents, applicants };
  }

  // Método de importação
  async importData(data: {users?: User[], consents?: ConsentRequest[], applicants?: Applicant[]}): Promise<void> {
    if (data.users) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify(data.users));
    }
    if (data.consents) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.CONSENTS, JSON.stringify(data.consents));
    }
    if (data.applicants) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.APPLICANTS, JSON.stringify(data.applicants));
    }
  }
}

// Classe para gerenciar a base de dados com Supabase
class SupabaseDatabaseService {
  // Métodos para Usuários
  async getUsers(): Promise<User[]> {
    try {
      const supabaseUsers = await userService.getAll();
      return supabaseUsers.map(user => {
        // Mapear role do Supabase para UserRole
        let mappedRole: UserRole = 'suporte'; // default
        if (user.role === 'admin') {
          mappedRole = 'superAdm';
        } else {
          mappedRole = 'comercial'; // ou 'suporte', dependendo da lógica
        }
        
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: mappedRole,
          active: true,
          createdAt: new Date(user.created_at),
          updatedAt: new Date(user.updated_at)
        };
      });
    } catch (error) {
      console.error('Erro ao buscar usuários do Supabase:', error);
      return [];
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const users = await this.getUsers();
      return users.find(user => user.id === id) || null;
    } catch (error) {
      console.error('Erro ao buscar usuário por ID:', error);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const users = await this.getUsers();
      return users.find(user => user.email === email) || null;
    } catch (error) {
      console.error('Erro ao buscar usuário por email:', error);
      return null;
    }
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      // Mapear UserRole para o tipo esperado pelo Supabase
      const supabaseRole = userData.role === 'superAdm' ? 'admin' : 'user';
      
      const supabaseUser = await userService.create({
        name: userData.name,
        email: userData.email,
        cpf: '',
        role: supabaseRole
      });
      
      return {
        id: supabaseUser.id,
        name: supabaseUser.name,
        email: supabaseUser.email,
        role: userData.role, // Usar o role original
        active: true,
        createdAt: new Date(supabaseUser.created_at),
        updatedAt: new Date(supabaseUser.updated_at)
      };
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  }

  async updateUser(id: string, userData: UpdateUserRequest): Promise<User | null> {
    console.warn('Update de usuário não implementado no Supabase service');
    return null;
  }

  async deleteUser(id: string): Promise<boolean> {
    console.warn('Delete de usuário não implementado no Supabase service');
    return false;
  }

  // Métodos para Consentimentos
  async getConsents(): Promise<ConsentRequest[]> {
    try {
      const supabaseConsents = await consentService.getAll();
      return supabaseConsents.map(consent => ({
        id: consent.id,
        dataUser: consent.data_user,
        dataUserType: consent.data_user_type,
        dataOwner: consent.data_owner,
        cpf: consent.cpf,
        dataTypes: consent.data_types,
        purpose: consent.purpose,
        legalBasis: consent.legal_basis,
        deadline: consent.deadline,
        controller: consent.controller,
        status: consent.status,
        createdAt: new Date(consent.created_at),
        approvedAt: consent.approved_at ? new Date(consent.approved_at) : undefined,
        rejectedAt: consent.rejected_at ? new Date(consent.rejected_at) : undefined,
        revokedAt: consent.revoked_at ? new Date(consent.revoked_at) : undefined,
        lastModified: new Date(consent.last_modified),
        scopes: consent.scopes || undefined,
        tokenId: consent.token_id || undefined,
        actionHistory: []
      }));
    } catch (error) {
      console.error('Erro ao buscar consentimentos do Supabase:', error);
      return [];
    }
  }

  async getConsentsByCpf(cpf: string): Promise<ConsentRequest[]> {
    try {
      const supabaseConsents = await consentService.getByCpf(cpf);
      return supabaseConsents.map(consent => this.mapSupabaseConsentToLocal(consent));
    } catch (error) {
      console.error('Erro ao buscar consentimentos por CPF do Supabase:', error);
      // Fallback para busca local
      const allConsents = await this.getConsents();
      return allConsents.filter(consent => consent.cpf === cpf);
    }
  }

  async createConsent(consentData: Omit<ConsentRequest, 'id' | 'createdAt' | 'lastModified'>): Promise<ConsentRequest> {
    try {
      const supabaseConsent = await consentService.create({
        data_user: consentData.dataUser,
        data_user_type: consentData.dataUserType,
        data_owner: consentData.dataOwner,
        cpf: consentData.cpf,
        data_types: consentData.dataTypes,
        purpose: consentData.purpose,
        legal_basis: consentData.legalBasis,
        deadline: consentData.deadline,
        controller: consentData.controller,
        status: consentData.status,
        approved_at: consentData.approvedAt?.toISOString() || null,
        rejected_at: consentData.rejectedAt?.toISOString() || null,
        revoked_at: consentData.revokedAt?.toISOString() || null,
        scopes: consentData.scopes || null,
        token_id: consentData.tokenId || null
      });

      return this.mapSupabaseConsentToLocal(supabaseConsent);
    } catch (error) {
      console.error('Erro ao criar consentimento:', error);
      throw error;
    }
  }

  async updateConsent(id: string, consentData: Partial<ConsentRequest>): Promise<ConsentRequest | null> {
    try {
      if (consentData.status === 'approved') {
        const updated = await consentService.approve(
          id, 
          consentData.scopes || undefined, 
          consentData.tokenId || undefined
        );
        return this.mapSupabaseConsentToLocal(updated);
      } else if (consentData.status === 'rejected') {
        const updated = await consentService.reject(id, 'Consentimento rejeitado');
        return this.mapSupabaseConsentToLocal(updated);
      } else if (consentData.revokedAt) {
        const updated = await consentService.revoke(id, 'Consentimento revogado');
        return this.mapSupabaseConsentToLocal(updated);
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao atualizar consentimento:', error);
      return null;
    }
  }

  private mapSupabaseConsentToLocal(supabaseConsent: any): ConsentRequest {
    return {
      id: supabaseConsent.id,
      dataUser: supabaseConsent.data_user,
      dataUserType: supabaseConsent.data_user_type,
      dataOwner: supabaseConsent.data_owner,
      cpf: supabaseConsent.cpf,
      dataTypes: supabaseConsent.data_types,
      purpose: supabaseConsent.purpose,
      legalBasis: supabaseConsent.legal_basis,
      deadline: supabaseConsent.deadline,
      controller: supabaseConsent.controller,
      status: supabaseConsent.status,
      createdAt: new Date(supabaseConsent.created_at),
      approvedAt: supabaseConsent.approved_at ? new Date(supabaseConsent.approved_at) : undefined,
      rejectedAt: supabaseConsent.rejected_at ? new Date(supabaseConsent.rejected_at) : undefined,
      revokedAt: supabaseConsent.revoked_at ? new Date(supabaseConsent.revoked_at) : undefined,
      lastModified: new Date(supabaseConsent.last_modified),
      scopes: supabaseConsent.scopes || undefined,
      tokenId: supabaseConsent.token_id || undefined,
      actionHistory: []
    };
  }

  // Método público para mapear consentimentos do Supabase
  public mapConsentFromSupabase(supabaseConsent: any): ConsentRequest {
    return this.mapSupabaseConsentToLocal(supabaseConsent);
  }

  // Métodos para Applicants
  async getApplicants(): Promise<Applicant[]> {
    try {
      const { data, error } = await supabase
        .from('applicants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar solicitantes:', error);
        throw error;
      }

      return data?.map(this.mapSupabaseApplicantToLocal) || [];
    } catch (error) {
      console.error('Erro ao buscar solicitantes:', error);
      return [];
    }
  }

  async createApplicant(applicantData: Omit<Applicant, 'id' | 'createdAt'>): Promise<Applicant> {
    try {
      const supabaseData = {
        name: applicantData.name,
        type: applicantData.type,
        cnpj: applicantData.cnpj || null,
        cpf: applicantData.cpf || null,
        email: applicantData.email,
        phone: applicantData.phone,
        address: applicantData.address,
        city: applicantData.city,
        state: applicantData.state,
        zip_code: applicantData.zipCode,
        responsible_person: applicantData.responsiblePerson || null,
        is_active: applicantData.isActive
      };

      const { data, error } = await supabase
        .from('applicants')
        .insert([supabaseData])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar solicitante:', error);
        throw error;
      }

      return this.mapSupabaseApplicantToLocal(data);
    } catch (error) {
      console.error('Erro ao criar solicitante:', error);
      throw error;
    }
  }

  async updateApplicant(id: string, applicantData: Partial<Applicant>): Promise<Applicant | null> {
    try {
      const supabaseData: any = {};
      
      if (applicantData.name !== undefined) supabaseData.name = applicantData.name;
      if (applicantData.type !== undefined) supabaseData.type = applicantData.type;
      if (applicantData.cnpj !== undefined) supabaseData.cnpj = applicantData.cnpj || null;
      if (applicantData.cpf !== undefined) supabaseData.cpf = applicantData.cpf || null;
      if (applicantData.email !== undefined) supabaseData.email = applicantData.email;
      if (applicantData.phone !== undefined) supabaseData.phone = applicantData.phone;
      if (applicantData.address !== undefined) supabaseData.address = applicantData.address;
      if (applicantData.city !== undefined) supabaseData.city = applicantData.city;
      if (applicantData.state !== undefined) supabaseData.state = applicantData.state;
      if (applicantData.zipCode !== undefined) supabaseData.zip_code = applicantData.zipCode;
      if (applicantData.responsiblePerson !== undefined) supabaseData.responsible_person = applicantData.responsiblePerson || null;
      if (applicantData.isActive !== undefined) supabaseData.is_active = applicantData.isActive;

      const { data, error } = await supabase
        .from('applicants')
        .update(supabaseData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar solicitante:', error);
        throw error;
      }

      return data ? this.mapSupabaseApplicantToLocal(data) : null;
    } catch (error) {
      console.error('Erro ao atualizar solicitante:', error);
      return null;
    }
  }

  private mapSupabaseApplicantToLocal(supabaseApplicant: any): Applicant {
    return {
      id: supabaseApplicant.id,
      name: supabaseApplicant.name,
      type: supabaseApplicant.type,
      cnpj: supabaseApplicant.cnpj,
      cpf: supabaseApplicant.cpf,
      email: supabaseApplicant.email,
      phone: supabaseApplicant.phone,
      address: supabaseApplicant.address,
      city: supabaseApplicant.city,
      state: supabaseApplicant.state,
      zipCode: supabaseApplicant.zip_code,
      responsiblePerson: supabaseApplicant.responsible_person,
      isActive: supabaseApplicant.is_active,
      createdAt: new Date(supabaseApplicant.created_at)
    };
  }

  // Métodos utilitários
  async clearAllData(): Promise<void> {
    console.warn('Clear all data não implementado para Supabase');
  }

  async exportData(): Promise<{users: User[], consents: ConsentRequest[], applicants: Applicant[]}> {
    const users = await this.getUsers();
    const consents = await this.getConsents();
    const applicants = await this.getApplicants();
    return { users, consents, applicants };
  }

  async importData(data: {users?: User[], consents?: ConsentRequest[], applicants?: Applicant[]}): Promise<void> {
    console.warn('Import data não implementado para Supabase');
  }

  async testConnection(): Promise<boolean> {
    return await testConnection();
  }

  private dateReviver(key: string, value: any) {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      return new Date(value);
    }
    return value;
  }
}

// Classe para API remota (mantida para compatibilidade)
class RemoteDatabaseService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  async getUserById(id: string): Promise<User> {
    return this.request<User>(`/users/${id}`);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      return await this.request<User>(`/users/email/${email}`);
    } catch (error) {
      return null;
    }
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    return this.request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string): Promise<void> {
    await this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async login(email: string, password: string): Promise<{user: User, token: string}> {
    return this.request<{user: User, token: string}>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout(): Promise<void> {
    // Implementar logout se necessário
  }
}

// Instâncias dos serviços
export const localDB = new LocalDatabaseService();
export const supabaseDB = new SupabaseDatabaseService();
export const remoteDB = new RemoteDatabaseService();

// Classe principal que gerencia qual serviço usar
class DatabaseService {
  private useSupabase: boolean;
  private useRemote: boolean;

  constructor() {
    // Em desenvolvimento, usar banco local por padrão
    // Em produção, usar Supabase
    this.useSupabase = import.meta.env.PROD || false;
    this.useRemote = false;
  }

  get users() {
    return this.useSupabase ? supabaseDB : (this.useRemote ? remoteDB : localDB);
  }

  get consents() {
    return this.useSupabase ? supabaseDB : localDB;
  }

  // Método específico para buscar consentimentos por CPF
  async getConsentsByCpf(cpf: string): Promise<ConsentRequest[]> {
    const service = this.useSupabase ? supabaseDB : localDB;
    return service.getConsentsByCpf(cpf);
  }

  // Métodos para ações de consentimento
  async approveConsent(id: string, scopes?: string[], tokenId?: string): Promise<ConsentRequest | null> {
    if (this.useSupabase) {
      try {
        const supabaseConsent = await consentService.approve(id, scopes, tokenId);
        return supabaseDB.mapConsentFromSupabase(supabaseConsent);
      } catch (error) {
        console.error('Erro ao aprovar consentimento:', error);
        throw error;
      }
    } else {
      // Implementação local
      const consent = await localDB.getConsents().then(consents => consents.find(c => c.id === id));
      if (!consent) return null;

      const updatedConsent = {
        ...consent,
        status: 'approved' as const,
        approvedAt: new Date(),
        scopes,
        tokenId,
        lastModified: new Date()
      };

      return localDB.updateConsent(id, updatedConsent);
    }
  }

  async rejectConsent(id: string, reason?: string): Promise<ConsentRequest | null> {
    if (this.useSupabase) {
      try {
        const supabaseConsent = await consentService.reject(id, reason);
        return supabaseDB.mapConsentFromSupabase(supabaseConsent);
      } catch (error) {
        console.error('Erro ao rejeitar consentimento:', error);
        throw error;
      }
    } else {
      // Implementação local
      const consent = await localDB.getConsents().then(consents => consents.find(c => c.id === id));
      if (!consent) return null;

      const updatedConsent = {
        ...consent,
        status: 'rejected' as const,
        rejectedAt: new Date(),
        lastModified: new Date()
      };

      return localDB.updateConsent(id, updatedConsent);
    }
  }

  async revokeConsent(id: string, reason?: string): Promise<ConsentRequest | null> {
    if (this.useSupabase) {
      try {
        const supabaseConsent = await consentService.revoke(id, reason);
        return supabaseDB.mapConsentFromSupabase(supabaseConsent);
      } catch (error) {
        console.error('Erro ao revogar consentimento:', error);
        throw error;
      }
    } else {
      // Implementação local
      const consent = await localDB.getConsents().then(consents => consents.find(c => c.id === id));
      if (!consent) return null;

      const updatedConsent = {
        ...consent,
        status: 'revoked' as const,
        revokedAt: new Date(),
        lastModified: new Date()
      };

      return localDB.updateConsent(id, updatedConsent);
    }
  }

  get applicants() {
    return this.useSupabase ? supabaseDB : localDB;
  }

  setSupabaseMode(enabled: boolean) {
    this.useSupabase = enabled;
    if (enabled) this.useRemote = false;
  }

  setRemoteMode(enabled: boolean) {
    this.useRemote = enabled;
    if (enabled) this.useSupabase = false;
  }

  isSupabaseMode(): boolean {
    return this.useSupabase;
  }

  isRemoteMode(): boolean {
    return this.useRemote;
  }

  async testConnection(): Promise<boolean> {
    if (this.useSupabase) {
      return await supabaseDB.testConnection();
    }
    return true; // Local sempre funciona
  }
}

export const db = new DatabaseService();
export default db;