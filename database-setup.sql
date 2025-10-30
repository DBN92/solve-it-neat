-- Script para criar todas as tabelas necessárias no Supabase
-- Execute este script no SQL Editor do Supabase Dashboard

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de solicitantes
CREATE TABLE IF NOT EXISTS public.applicants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    cnpj VARCHAR(18) NULL,
    cpf VARCHAR(14) NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    responsible_person VARCHAR(255) NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_document CHECK (cnpj IS NOT NULL OR cpf IS NOT NULL)
);

-- Tabela de solicitações de consentimento
CREATE TABLE IF NOT EXISTS public.consent_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    data_user VARCHAR(255) NOT NULL,
    data_user_type VARCHAR(100) NOT NULL,
    data_owner VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) NOT NULL,
    data_types TEXT[] NOT NULL,
    purpose TEXT NOT NULL,
    legal_basis VARCHAR(255) NOT NULL,
    deadline VARCHAR(50) NOT NULL,
    controller VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE NULL,
    rejected_at TIMESTAMP WITH TIME ZONE NULL,
    revoked_at TIMESTAMP WITH TIME ZONE NULL,
    last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scopes TEXT[] NULL,
    token_id VARCHAR(255) NULL
);

-- Tabela de ações de consentimento (histórico)
CREATE TABLE IF NOT EXISTS public.consent_actions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    consent_id UUID NOT NULL REFERENCES public.consent_requests(id) ON DELETE CASCADE,
    action VARCHAR(20) NOT NULL CHECK (action IN ('created', 'approved', 'rejected', 'revoked')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    performed_by VARCHAR(10) NOT NULL CHECK (performed_by IN ('user', 'system')),
    reason TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_consent_requests_cpf ON public.consent_requests(cpf);
CREATE INDEX IF NOT EXISTS idx_consent_requests_status ON public.consent_requests(status);
CREATE INDEX IF NOT EXISTS idx_consent_requests_created_at ON public.consent_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_consent_actions_consent_id ON public.consent_actions(consent_id);
CREATE INDEX IF NOT EXISTS idx_consent_actions_timestamp ON public.consent_actions(timestamp);
CREATE INDEX IF NOT EXISTS idx_users_cpf ON public.users(cpf);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_applicants_email ON public.applicants(email);
CREATE INDEX IF NOT EXISTS idx_applicants_cnpj ON public.applicants(cnpj);
CREATE INDEX IF NOT EXISTS idx_applicants_cpf ON public.applicants(cpf);
CREATE INDEX IF NOT EXISTS idx_applicants_is_active ON public.applicants(is_active);

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at na tabela users
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar updated_at na tabela applicants
DROP TRIGGER IF EXISTS update_applicants_updated_at ON public.applicants;
CREATE TRIGGER update_applicants_updated_at 
    BEFORE UPDATE ON public.applicants 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Função para atualizar o campo last_modified automaticamente
CREATE OR REPLACE FUNCTION update_last_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_modified = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar last_modified na tabela consent_requests
DROP TRIGGER IF EXISTS update_consent_requests_last_modified ON public.consent_requests;
CREATE TRIGGER update_consent_requests_last_modified 
    BEFORE UPDATE ON public.consent_requests 
    FOR EACH ROW 
    EXECUTE FUNCTION update_last_modified_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_actions ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança básicas (podem ser ajustadas conforme necessário)
-- Permitir leitura para usuários autenticados
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON public.users;
CREATE POLICY "Allow read access for authenticated users" ON public.users
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow read access for authenticated users" ON public.applicants;
CREATE POLICY "Allow read access for authenticated users" ON public.applicants
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow read access for authenticated users" ON public.consent_requests;
CREATE POLICY "Allow read access for authenticated users" ON public.consent_requests
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow read access for authenticated users" ON public.consent_actions;
CREATE POLICY "Allow read access for authenticated users" ON public.consent_actions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir inserção para usuários autenticados
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.applicants;
CREATE POLICY "Allow insert for authenticated users" ON public.applicants
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.consent_requests;
CREATE POLICY "Allow insert for authenticated users" ON public.consent_requests
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.consent_actions;
CREATE POLICY "Allow insert for authenticated users" ON public.consent_actions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir atualização para usuários autenticados
DROP POLICY IF EXISTS "Allow update for authenticated users" ON public.applicants;
CREATE POLICY "Allow update for authenticated users" ON public.applicants
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow update for authenticated users" ON public.consent_requests;
CREATE POLICY "Allow update for authenticated users" ON public.consent_requests
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Inserir alguns dados de exemplo
INSERT INTO public.users (email, name, cpf, role) VALUES
    ('admin@example.com', 'Administrador', '000.000.000-00', 'admin'),
    ('joao@example.com', 'João da Silva Santos', '123.456.789-00', 'user'),
    ('maria@example.com', 'Maria Oliveira', '987.654.321-00', 'user')
ON CONFLICT (email) DO NOTHING;

-- Inserir alguns solicitantes de exemplo
INSERT INTO public.applicants (name, type, cnpj, email, phone, address, city, state, zip_code, responsible_person, is_active) VALUES
    ('TechCorp Ltda', 'Fintech', '12.345.678/0001-90', 'contato@techcorp.com', '(11) 99999-1234', 'Av. Paulista, 1000', 'São Paulo', 'SP', '01310-100', 'Carlos Silva', true),
    ('DataAnalytics S.A.', 'Empresa de Análise', '98.765.432/0001-10', 'info@dataanalytics.com', '(21) 88888-5678', 'Rua das Flores, 500', 'Rio de Janeiro', 'RJ', '20040-020', 'Ana Santos', true),
    ('Marketing Plus', 'Agência de Marketing', '11.222.333/0001-44', 'contato@marketingplus.com', '(31) 77777-9012', 'Rua da Liberdade, 200', 'Belo Horizonte', 'MG', '30112-000', 'Pedro Costa', false),
    ('Seguros Brasil', 'Seguradora', '55.666.777/0001-88', 'atendimento@segurosbrasil.com', '(85) 66666-3456', 'Av. Beira Mar, 300', 'Fortaleza', 'CE', '60165-121', 'Lucia Oliveira', true)
ON CONFLICT DO NOTHING;

-- Inserir alguns consentimentos de exemplo
INSERT INTO public.consent_requests (
    data_user, data_user_type, data_owner, cpf, data_types, purpose, 
    legal_basis, deadline, controller, status
) VALUES
    (
        'TechCorp Ltda', 'Empresa', 'João da Silva Santos', '123.456.789-00',
        ARRAY['Nome completo', 'CPF', 'E-mail', 'Telefone'],
        'Processamento de dados para análise de crédito e ofertas personalizadas',
        'Consentimento (Art. 7º, I, LGPD)', '12 meses', 'TechCorp Ltda', 'pending'
    ),
    (
        'DataAnalytics S.A.', 'Empresa', 'João da Silva Santos', '123.456.789-00',
        ARRAY['Dados de localização', 'Histórico de navegação'],
        'Análise de comportamento para melhorias no produto',
        'Legítimo interesse (Art. 7º, IX, LGPD)', '6 meses', 'DataAnalytics S.A.', 'approved'
    ),
    (
        'Marketing Plus', 'Empresa', 'Maria Oliveira', '987.654.321-00',
        ARRAY['Nome', 'E-mail', 'Preferências'],
        'Envio de comunicações promocionais',
        'Consentimento (Art. 7º, I, LGPD)', '24 meses', 'Marketing Plus', 'rejected'
    )
ON CONFLICT DO NOTHING;

-- Inserir ações de exemplo
INSERT INTO public.consent_actions (consent_id, action, performed_by, reason)
SELECT 
    cr.id,
    'created',
    'system',
    'Solicitação criada automaticamente'
FROM public.consent_requests cr
WHERE NOT EXISTS (
    SELECT 1 FROM public.consent_actions ca 
    WHERE ca.consent_id = cr.id AND ca.action = 'created'
);

COMMENT ON TABLE public.users IS 'Tabela de usuários do sistema';
COMMENT ON TABLE public.applicants IS 'Tabela de solicitantes que podem criar manifestações de consentimento';
COMMENT ON TABLE public.consent_requests IS 'Tabela de solicitações de consentimento LGPD';
COMMENT ON TABLE public.consent_actions IS 'Tabela de histórico de ações nos consentimentos';