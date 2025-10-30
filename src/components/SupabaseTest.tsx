import React, { useState } from 'react';
import { db } from '../services/database';

const SupabaseTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    setTestResult('Testando conexão...');
    
    try {
      const isConnected = await db.testConnection();
      if (isConnected) {
        setTestResult('✅ Conexão com Supabase estabelecida com sucesso!');
      } else {
        setTestResult('❌ Falha na conexão com Supabase');
      }
    } catch (error) {
      setTestResult(`❌ Erro ao testar conexão: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testUsers = async () => {
    setIsLoading(true);
    setTestResult('Testando busca de usuários...');
    
    try {
      const users = await db.users.getUsers();
      setTestResult(`✅ Usuários encontrados: ${users.length}\n${JSON.stringify(users, null, 2)}`);
    } catch (error) {
      setTestResult(`❌ Erro ao buscar usuários: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testConsents = async () => {
    setIsLoading(true);
    setTestResult('Testando busca de consentimentos...');
    
    try {
      const consents = await db.consents.getConsents();
      setTestResult(`✅ Consentimentos encontrados: ${consents.length}\n${JSON.stringify(consents, null, 2)}`);
    } catch (error) {
      setTestResult(`❌ Erro ao buscar consentimentos: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testApplicants = async () => {
    setIsLoading(true);
    setTestResult('Testando busca de solicitantes...');
    
    try {
      const applicants = await db.applicants.getApplicants();
      setTestResult(`✅ Solicitantes encontrados: ${applicants.length}\n${JSON.stringify(applicants, null, 2)}`);
    } catch (error) {
      setTestResult(`❌ Erro ao buscar solicitantes: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSupabaseMode = () => {
    const currentMode = db.isSupabaseMode();
    db.setSupabaseMode(!currentMode);
    setTestResult(`Modo alterado para: ${!currentMode ? 'Supabase' : 'Local'}`);
  };

  const createTestApplicant = async () => {
    setIsLoading(true);
    setTestResult('Criando solicitante de teste...');
    
    try {
      const newApplicant = await db.applicants.createApplicant({
        name: 'Empresa Teste Supabase',
        type: 'Fintech',
        cnpj: '12.345.678/0001-99',
        cpf: null,
        email: 'teste@empresateste.com',
        phone: '(11) 99999-9999',
        address: 'Rua Teste, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        responsiblePerson: 'João Teste',
        isActive: true
      });
      setTestResult(`✅ Solicitante criado com sucesso!\n${JSON.stringify(newApplicant, null, 2)}`);
    } catch (error) {
      setTestResult(`❌ Erro ao criar solicitante: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Teste de Conexão Supabase</h2>
      
      <div className="space-y-4">
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-700">
            Modo atual: <strong>{db.isSupabaseMode() ? 'Supabase' : 'Local'}</strong>
          </p>
          <button
            onClick={toggleSupabaseMode}
            className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
          >
            Alternar para {db.isSupabaseMode() ? 'Local' : 'Supabase'}
          </button>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={testConnection}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Testar Conexão
          </button>
          
          <button
            onClick={testUsers}
            disabled={isLoading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            Buscar Usuários
          </button>
          
          <button
            onClick={testConsents}
            disabled={isLoading}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
          >
            Buscar Consentimentos
          </button>
          
          <button
            onClick={testApplicants}
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50"
          >
            Buscar Solicitantes
          </button>
          
          <button
            onClick={createTestApplicant}
            disabled={isLoading}
            className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 disabled:opacity-50"
          >
            Criar Solicitante Teste
          </button>
        </div>
        
        {testResult && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h3 className="font-semibold mb-2">Resultado do Teste:</h3>
            <pre className="whitespace-pre-wrap text-sm">{testResult}</pre>
          </div>
        )}
        
        {isLoading && (
          <div className="text-blue-500">
            Carregando...
          </div>
        )}
      </div>
      
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold text-yellow-800 mb-2">Instruções:</h3>
        <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
          <li>Primeiro, execute o script SQL no Supabase para criar as tabelas (users, applicants, consent_requests, consent_actions)</li>
          <li>Alterne para o modo Supabase usando o botão acima</li>
          <li>Teste a conexão para verificar se está funcionando</li>
          <li>Teste as operações de busca e criação para usuários, consentimentos e solicitantes</li>
          <li>Verifique se os dados estão sendo salvos corretamente no Supabase</li>
        </ol>
      </div>
    </div>
  );
};

export default SupabaseTest;