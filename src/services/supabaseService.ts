import { supabase } from '../lib/supabase'

// Interfaces para os tipos de dados
export interface ConsentRequest {
  id: string
  data_user: string
  data_user_type: string
  data_owner: string
  cpf: string
  data_types: string[]
  purpose: string
  legal_basis: string
  deadline: string
  controller: string
  status: 'pending' | 'approved' | 'rejected' | 'revoked'
  created_at: string
  approved_at?: string | null
  rejected_at?: string | null
  revoked_at?: string | null
  last_modified: string
  scopes?: string[] | null
  token_id?: string | null
}

export interface ConsentAction {
  id: string
  consent_id: string
  action: 'created' | 'approved' | 'rejected' | 'revoked'
  timestamp: string
  performed_by: 'user' | 'system'
  reason?: string | null
  created_at: string
}

export interface User {
  id: string
  email: string
  name: string
  cpf: string
  role: 'admin' | 'user'
  created_at: string
  updated_at: string
}

// Serviços para Consent Requests
export const consentService = {
  // Buscar todos os consentimentos
  async getAll(): Promise<ConsentRequest[]> {
    const { data, error } = await supabase
      .from('consent_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar consentimentos:', error)
      throw error
    }

    return data || []
  },

  // Buscar consentimentos por CPF
  async getByCpf(cpf: string): Promise<ConsentRequest[]> {
    const { data, error } = await supabase
      .from('consent_requests')
      .select('*')
      .eq('cpf', cpf)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar consentimentos por CPF:', error)
      throw error
    }

    return data || []
  },

  // Buscar consentimento por ID
  async getById(id: string): Promise<ConsentRequest | null> {
    const { data, error } = await supabase
      .from('consent_requests')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erro ao buscar consentimento por ID:', error)
      throw error
    }

    return data
  },

  // Criar novo consentimento
  async create(consent: Omit<ConsentRequest, 'id' | 'created_at' | 'last_modified'>): Promise<ConsentRequest> {
    const { data, error } = await supabase
      .from('consent_requests')
      .insert([consent])
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar consentimento:', error)
      throw error
    }

    // Criar ação de criação
    await actionService.create({
      consent_id: data.id,
      action: 'created',
      performed_by: 'system',
      reason: 'Solicitação criada'
    })

    return data
  },

  // Aprovar consentimento
  async approve(id: string, scopes?: string[], tokenId?: string): Promise<ConsentRequest> {
    const now = new Date().toISOString()
    
    const { data, error } = await supabase
      .from('consent_requests')
      .update({
        status: 'approved',
        approved_at: now,
        scopes: scopes || null,
        token_id: tokenId || null
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao aprovar consentimento:', error)
      throw error
    }

    // Criar ação de aprovação
    await actionService.create({
      consent_id: id,
      action: 'approved',
      performed_by: 'user',
      reason: 'Consentimento aprovado'
    })

    return data
  },

  // Rejeitar consentimento
  async reject(id: string, reason?: string): Promise<ConsentRequest> {
    const now = new Date().toISOString()
    
    const { data, error } = await supabase
      .from('consent_requests')
      .update({
        status: 'rejected',
        rejected_at: now
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao rejeitar consentimento:', error)
      throw error
    }

    // Criar ação de rejeição
    await actionService.create({
      consent_id: id,
      action: 'rejected',
      performed_by: 'user',
      reason: reason || 'Consentimento rejeitado'
    })

    return data
  },

  // Revogar consentimento
  async revoke(id: string, reason?: string): Promise<ConsentRequest> {
    const now = new Date().toISOString()
    
    const { data, error } = await supabase
      .from('consent_requests')
      .update({
        revoked_at: now
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao revogar consentimento:', error)
      throw error
    }

    // Criar ação de revogação
    await actionService.create({
      consent_id: id,
      action: 'revoked',
      performed_by: 'user',
      reason: reason || 'Consentimento revogado'
    })

    return data
  }
}

// Serviços para Actions
export const actionService = {
  // Buscar ações por consentimento
  async getByConsentId(consentId: string): Promise<ConsentAction[]> {
    const { data, error } = await supabase
      .from('consent_actions')
      .select('*')
      .eq('consent_id', consentId)
      .order('timestamp', { ascending: true })

    if (error) {
      console.error('Erro ao buscar ações:', error)
      throw error
    }

    return data || []
  },

  // Criar nova ação
  async create(action: Omit<ConsentAction, 'id' | 'timestamp' | 'created_at'>): Promise<ConsentAction> {
    const { data, error } = await supabase
      .from('consent_actions')
      .insert([action])
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar ação:', error)
      throw error
    }

    return data
  }
}

// Serviços para Users
export const userService = {
  // Buscar todos os usuários
  async getAll(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar usuários:', error)
      throw error
    }

    return data || []
  },

  // Buscar usuário por CPF
  async getByCpf(cpf: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('cpf', cpf)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Erro ao buscar usuário por CPF:', error)
      throw error
    }

    return data
  },

  // Criar novo usuário
  async create(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar usuário:', error)
      throw error
    }

    return data
  }
}

// Função para testar conexão
export const testConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (error) {
      console.error('Erro na conexão:', error)
      return false
    }

    console.log('Conexão com Supabase estabelecida com sucesso!')
    return true
  } catch (error) {
    console.error('Erro ao testar conexão:', error)
    return false
  }
}