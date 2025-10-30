import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, ExternalLink, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

interface GovBrUserData {
  cpf: string;
  name: string;
  email: string;
  phone?: string;
  birthDate?: string;
}

export function GovBrLogin() {
  const { user, loginWithGovBr } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [authStep, setAuthStep] = useState<'initial' | 'redirecting' | 'processing' | 'completed'>('initial');

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Simulate gov.br OAuth flow
  const handleGovBrLogin = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    setAuthStep('redirecting');

    try {
      // Clear any existing auth data for testing
      localStorage.removeItem('currentUser');
      localStorage.removeItem('users');
      console.log('🔍 GovBrLogin - Cleared localStorage for testing');

      // Step 1: Redirect to gov.br (simulated)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setAuthStep('processing');
      setSuccess('Redirecionando para gov.br...');
      
      // Step 2: Simulate OAuth callback processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 3: Simulate receiving user data from gov.br
      const mockGovBrData: GovBrUserData = {
        cpf: '123.456.789-00',
        name: 'João Silva Santos',
        email: 'joao.silva@email.com',
        phone: '(11) 99999-9999',
        birthDate: '1985-03-15'
      };

      console.log('🔍 GovBrLogin - Mock data:', mockGovBrData);
      setSuccess('Dados recebidos do gov.br. Processando cadastro...');
      
      // Step 4: Check if user exists or create new user
      await processGovBrUser(mockGovBrData);
      
      setAuthStep('completed');
      setSuccess('Login realizado com sucesso! Redirecionando...');
      
      // Redirect to main app
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error) {
      console.error('Erro no login gov.br:', error);
      setError('Erro ao autenticar com gov.br. Tente novamente.');
      setAuthStep('initial');
    } finally {
      setIsLoading(false);
    }
  };

  const processGovBrUser = async (govBrData: GovBrUserData) => {
    // Use the loginWithGovBr function from AuthContext
    const success = await loginWithGovBr(govBrData);
    
    if (!success) {
      throw new Error('Falha ao processar dados do usuário gov.br');
    }
    
    console.log('✅ Usuário processado com sucesso via gov.br');
  };

  const getStepIcon = () => {
    switch (authStep) {
      case 'redirecting':
        return <ExternalLink className="w-5 h-5 text-blue-600" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Shield className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStepMessage = () => {
    switch (authStep) {
      case 'redirecting':
        return 'Conectando com gov.br...';
      case 'processing':
        return 'Processando autenticação...';
      case 'completed':
        return 'Autenticação concluída!';
      default:
        return 'Pronto para autenticar';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-green-50 to-blue-100 p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-green-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-green-300/10 to-blue-400/10 rounded-full blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 backdrop-blur-sm bg-white/90 border-white/20 shadow-2xl shadow-green-500/10">
        <CardHeader className="space-y-4 text-center pb-8">
          {/* Gov.br Logo/Icon */}
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25">
            <Shield className="w-8 h-8 text-white" />
          </div>
          
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Acesso para Donos de Dados
            </CardTitle>
            <CardDescription className="text-gray-600">
              Entre com sua conta gov.br para gerenciar seus consentimentos de dados pessoais
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Status indicator */}
          <div className="flex items-center justify-center space-x-3 p-4 bg-gray-50 rounded-lg border">
            {getStepIcon()}
            <span className="text-sm font-medium text-gray-700">
              {getStepMessage()}
            </span>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* Login Button */}
          <Button
            onClick={handleGovBrLogin}
            disabled={isLoading || authStep !== 'initial'}
            className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold shadow-lg shadow-green-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Conectando com gov.br...
              </>
            ) : (
              <>
                <ExternalLink className="mr-2 h-5 w-5" />
                Acessar meus consentimentos via gov.br
              </>
            )}
          </Button>

          {/* Debug button */}
          <Button 
            onClick={() => {
              console.log('🔍 Debug - Current localStorage:');
              console.log('Users:', localStorage.getItem('consent_app_users'));
              console.log('Auth User:', localStorage.getItem('consent_app_auth_user'));
              console.log('Current user from context:', user);
            }}
            variant="outline"
            className="w-full mt-2"
            size="sm"
          >
            Debug Info
          </Button>

          {/* Information */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900">Como funciona:</h4>
            <ul className="text-xs text-gray-600 space-y-2">
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>Você será redirecionado para o portal gov.br</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>Faça login com seu CPF e senha do gov.br</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>Seus dados serão automaticamente cadastrados no sistema</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>Acesso imediato ao sistema de consentimentos</span>
              </li>
            </ul>
          </div>

          {/* Security notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-700">
                <p className="font-medium mb-1">Segurança garantida</p>
                <p>Utilizamos o padrão OAuth 2.0 do gov.br para garantir a segurança dos seus dados.</p>
              </div>
            </div>
          </div>

          {/* Alternative login option */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">
                Prefere usar login tradicional?
              </p>
              <Link to="/login">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao login tradicional
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default GovBrLogin;