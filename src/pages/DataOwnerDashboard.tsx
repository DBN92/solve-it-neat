import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Shield, 
  User, 
  Calendar,
  FileText,
  History,
  ChevronDown,
  ChevronUp,
  LogOut,
  Activity,
  Award,
  AlertTriangle,
  Eye,
  EyeOff,
  Building,
  Database,
  Key,
  Lock,
  Zap,
  TrendingUp,
  BarChart3,
  CreditCard,
  Home,
  Settings,
  Bug
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/services/database';
import Logo from '@/components/Logo';

interface ConsentAction {
  id: string;
  action: 'created' | 'approved' | 'rejected' | 'revoked';
  timestamp: Date;
  performedBy: 'user' | 'system';
  reason?: string;
}

interface ConsentRequest {
  id: string;
  dataUser: string;
  dataUserType: string;
  dataOwner: string;
  cpf: string;
  dataTypes: string[];
  purpose: string;
  legalBasis: string;
  deadline: string;
  controller: string;
  status: 'pending' | 'approved' | 'rejected' | 'revoked';
  createdAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  revokedAt?: Date;
  lastModified: Date;
  scopes?: string[];
  tokenId?: string;
  actionHistory: ConsentAction[];
}

const DataOwnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [consents, setConsents] = useState<ConsentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedConsent, setExpandedConsent] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'revoked'>('all');
  const [controllerFilter, setControllerFilter] = useState<string>('all');
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  const loadConsents = useCallback(async () => {
    if (!user) {
      console.log('❌ DataOwnerDashboard - Usuário não logado, não carregando consentimentos');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('🔍 DataOwnerDashboard - Iniciando carregamento de consentimentos...');
      console.log('🔍 DataOwnerDashboard - Usuário logado:', user);
      console.log('🔍 DataOwnerDashboard - Email do usuário:', user.email);
      console.log('🔍 DataOwnerDashboard - Nome do usuário:', user.name);
      
      // Testar primeiro se o serviço de database está funcionando
      console.log('🔍 DataOwnerDashboard - Testando busca de todos os consentimentos...');
      const allConsents = await db.consents.getConsents();
      console.log('📋 DataOwnerDashboard - Total de consentimentos no sistema:', allConsents.length);
      console.log('📋 DataOwnerDashboard - Consentimentos encontrados:', allConsents);
      
      // Testar busca específica por CPF 12345678900
      console.log('🔍 DataOwnerDashboard - Testando busca por CPF 12345678900...');
      const testConsents = await db.getConsentsByCpf('12345678900');
      console.log('📋 DataOwnerDashboard - Consentimentos para CPF 12345678900:', testConsents.length);
      console.log('📋 DataOwnerDashboard - Detalhes dos consentimentos:', testConsents);
      
      // Para o usuário João Silva, sempre usar CPF 12345678900
      if (user.name === 'João Silva' || user.email === 'joao.silva@exemplo.com') {
        console.log('✅ DataOwnerDashboard - Usuário identificado como João Silva, usando CPF 12345678900');
        setConsents(testConsents);
      } else {
        // Para outros usuários, tentar buscar por email como fallback
        console.log('🔍 DataOwnerDashboard - Usuário não é João Silva, tentando buscar por email...');
        const emailConsents = await db.getConsentsByCpf(user.email);
        console.log('📋 DataOwnerDashboard - Consentimentos para email', user.email, ':', emailConsents.length);
        setConsents(emailConsents);
      }
      
      console.log('✅ DataOwnerDashboard - Carregamento de consentimentos concluído');
    } catch (error) {
      console.error('💥 DataOwnerDashboard - Erro ao carregar consentimentos:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadConsents();
  }, [loadConsents]);

  const handleApprove = async (consentId: string) => {
    try {
      await db.approveConsent(consentId);
      await loadConsents();
    } catch (error) {
      console.error('Erro ao aprovar consentimento:', error);
    }
  };

  const handleReject = async (consentId: string) => {
    try {
      await db.rejectConsent(consentId);
      await loadConsents();
    } catch (error) {
      console.error('Erro ao rejeitar consentimento:', error);
    }
  };

  const handleRevoke = async (consentId: string) => {
    try {
      await db.revokeConsent(consentId);
      await loadConsents();
    } catch (error) {
      console.error('Erro ao revogar consentimento:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'revoked':
        return <Lock className="h-4 w-4 text-gray-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      revoked: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status === 'approved' ? 'Aprovado' : 
         status === 'rejected' ? 'Rejeitado' : 
         status === 'revoked' ? 'Revogado' :
         status === 'pending' ? 'Pendente' : status}
      </Badge>
    );
  };

  // Extrair lista única de solicitantes (controllers)
  const uniqueControllers = Array.from(new Set(consents.map(consent => consent.controller))).sort();

  // Filtrar consentimentos baseado no status e solicitante selecionados
  const filteredConsents = consents.filter(consent => {
    const statusMatch = statusFilter === 'all' || consent.status === statusFilter;
    const controllerMatch = controllerFilter === 'all' || consent.controller === controllerFilter;
    return statusMatch && controllerMatch;
  });

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando seus consentimentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Meus Consentimentos de Dados
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDebugInfo(!showDebugInfo)}
                className="text-gray-500 hover:text-gray-700"
                title={showDebugInfo ? "Ocultar informações de debug" : "Mostrar informações de debug"}
              >
                {showDebugInfo ? <EyeOff className="h-4 w-4" /> : <Bug className="h-4 w-4" />}
              </Button>
            </CardTitle>
            
            {/* Filtros */}
            <div className="space-y-3 mt-4">
              {/* Filtro por Status */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Filtrar por status:</span>
                <Select value={statusFilter} onValueChange={(value: 'all' | 'pending' | 'approved' | 'rejected' | 'revoked') => setStatusFilter(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Selecione um status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="approved">Aprovado</SelectItem>
                    <SelectItem value="rejected">Rejeitado</SelectItem>
                    <SelectItem value="revoked">Revogado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Filtro por Solicitante */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Filtrar por solicitante:</span>
                <Select value={controllerFilter} onValueChange={setControllerFilter}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Selecione um solicitante" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Solicitantes</SelectItem>
                    {uniqueControllers.map(controller => (
                      <SelectItem key={controller} value={controller}>
                        {controller}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Contador de resultados */}
              <div className="flex justify-end">
                <span className="text-sm text-gray-500">
                  ({filteredConsents.length} de {consents.length} consentimentos)
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Debug: Mostrar informações de debug */}
            {showDebugInfo && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Debug Info:</h4>
                <p className="text-sm text-blue-700">
                  <strong>Usuário:</strong> {user?.name} ({user?.email})
                </p>
                <p className="text-sm text-blue-700">
                  <strong>Total de consentimentos:</strong> {consents.length}
                </p>
                <p className="text-sm text-blue-700">
                  <strong>Loading:</strong> {isLoading ? 'Sim' : 'Não'}
                </p>
                <div className="mt-2">
                  <Button 
                    onClick={() => {
                      console.log('🔄 Botão de teste clicado - forçando carregamento...');
                      loadConsents();
                    }}
                    variant="outline"
                    size="sm"
                    className="mr-2"
                  >
                    🔄 Testar Carregamento
                  </Button>
                  <Button 
                    onClick={async () => {
                      console.log('🧪 Teste direto do database...');
                      try {
                        const allConsents = await db.consents.getConsents();
                        console.log('📋 Todos os consentimentos:', allConsents);
                        const cpfConsents = await db.getConsentsByCpf('12345678900');
                        console.log('📋 Consentimentos para CPF 12345678900:', cpfConsents);
                        alert(`Total: ${allConsents.length}, CPF 12345678900: ${cpfConsents.length}`);
                      } catch (error) {
                        console.error('💥 Erro no teste:', error);
                        alert('Erro no teste: ' + error);
                      }
                    }}
                    variant="outline"
                    size="sm"
                  >
                    🧪 Teste Database
                  </Button>
                  <Button 
                    onClick={() => {
                      console.log('🗑️ Limpando localStorage...');
                      localStorage.removeItem('consent_app_consents');
                      console.log('✅ localStorage limpo');
                      alert('localStorage limpo! Clique em "Testar Carregamento" para reinicializar.');
                    }}
                    variant="outline"
                    size="sm"
                    className="mr-2"
                  >
                    🗑️ Limpar Storage
                  </Button>
                  <Button 
                    onClick={() => {
                      console.log('🔍 Verificando localStorage...');
                      const stored = localStorage.getItem('consent_app_consents');
                      console.log('📋 Dados no localStorage:', stored);
                      if (stored) {
                        const parsed = JSON.parse(stored);
                        console.log('📋 Dados parseados:', parsed);
                        alert(`Encontrados ${parsed.length} consentimentos no localStorage`);
                      } else {
                        alert('Nenhum dado encontrado no localStorage');
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="mr-2"
                  >
                    🔍 Ver Storage
                  </Button>
                  <Button 
                    onClick={async () => {
                      console.log('🔄 Forçando inicialização dos dados padrão...');
                      try {
                        // Limpar localStorage primeiro
                        localStorage.removeItem('consent_app_consents');
                        
                        // Forçar carregamento dos dados padrão
                        const consents = await db.consents.getConsents();
                        console.log('📋 Dados padrão carregados:', consents);
                        
                        // Recarregar os consentimentos na tela
                        await loadConsents();
                        
                        alert(`Dados padrão inicializados! ${consents.length} consentimentos carregados.`);
                      } catch (error) {
                        console.error('💥 Erro na inicialização:', error);
                        alert('Erro na inicialização: ' + error);
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="mr-2"
                  >
                    🔄 Inicializar Padrão
                  </Button>
                </div>
                {consents.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-blue-700"><strong>Consentimentos encontrados:</strong></p>
                    <ul className="text-xs text-blue-600 ml-4">
                      {consents.map(consent => (
                        <li key={consent.id}>
                          {consent.dataUser} - {consent.status} (CPF: {consent.cpf})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            {filteredConsents.length === 0 ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {consents.length === 0 
                    ? 'Você ainda não possui consentimentos registrados.'
                    : (() => {
                        const hasStatusFilter = statusFilter !== 'all';
                        const hasControllerFilter = controllerFilter !== 'all';
                        
                        if (hasStatusFilter && hasControllerFilter) {
                          return `Nenhum consentimento encontrado com o status "${statusFilter}" do solicitante "${controllerFilter}".`;
                        } else if (hasStatusFilter) {
                          return `Nenhum consentimento encontrado com o status "${statusFilter}".`;
                        } else if (hasControllerFilter) {
                          return `Nenhum consentimento encontrado do solicitante "${controllerFilter}".`;
                        } else {
                          return 'Nenhum consentimento encontrado com os filtros aplicados.';
                        }
                      })()
                  }
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {filteredConsents.map((consent) => (
                  <Card key={consent.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{consent.dataUser}</h3>
                            {getStatusBadge(consent.status)}
                          </div>
                          <p className="text-gray-600 mb-2">{consent.purpose}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(consent.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Building className="h-4 w-4" />
                              {consent.controller}
                            </span>
                            {consent.status === 'revoked' && consent.revokedAt && (
                              <span className="flex items-center gap-1 text-red-600">
                                <XCircle className="h-4 w-4" />
                                Revogado em {formatDate(consent.revokedAt)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(consent.status)}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedConsent(
                              expandedConsent === consent.id ? null : consent.id
                            )}
                          >
                            {expandedConsent === consent.id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {expandedConsent === consent.id && (
                        <div className="border-t pt-4 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium mb-2 flex items-center gap-2">
                                <Database className="h-4 w-4" />
                                Tipos de Dados
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {consent.dataTypes.map((type, index) => (
                                  <Badge key={index} variant="outline">
                                    {type}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2 flex items-center gap-2">
                                <Key className="h-4 w-4" />
                                Base Legal
                              </h4>
                              <p className="text-sm text-gray-600">{consent.legalBasis}</p>
                            </div>
                          </div>

                          <Separator />

                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Detalhes do Consentimento
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">CPF:</span> {consent.cpf}
                              </div>
                              <div>
                                <span className="font-medium">Prazo:</span> {consent.deadline}
                              </div>
                              <div>
                                <span className="font-medium">Tipo de Usuário:</span> {consent.dataUserType}
                              </div>
                              <div>
                                <span className="font-medium">Última Modificação:</span> {formatDate(consent.lastModified)}
                              </div>
                            </div>
                          </div>

                          {consent.status === 'pending' && (
                            <div className="flex gap-2 pt-4">
                              <Button
                                onClick={() => handleApprove(consent.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Aprovar
                              </Button>
                              <Button
                                onClick={() => handleReject(consent.id)}
                                variant="destructive"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Rejeitar
                              </Button>
                            </div>
                          )}

                          {consent.status === 'approved' && !consent.revokedAt && (
                            <div className="pt-4">
                              <Button
                                onClick={() => handleRevoke(consent.id)}
                                variant="outline"
                                className="border-red-300 text-red-600 hover:bg-red-50"
                              >
                                <Lock className="h-4 w-4 mr-2" />
                                Revogar Consentimento
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataOwnerDashboard;