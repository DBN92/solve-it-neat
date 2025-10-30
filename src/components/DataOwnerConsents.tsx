import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
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
  Building,
  Database,
  Key,
  Lock,
  Zap,
  TrendingUp,
  BarChart3,
  CreditCard
} from 'lucide-react';

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

interface DataOwnerConsentsProps {
  consents: ConsentRequest[];
  onApprove?: (id: string) => void;
  onRevoke?: (id: string) => void;
}

const DataOwnerConsents: React.FC<DataOwnerConsentsProps> = ({ consents, onApprove, onRevoke }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loggedUserName, setLoggedUserName] = useState('');
  const [loggedUserCpf, setLoggedUserCpf] = useState('');
  const [expandedConsent, setExpandedConsent] = useState<string | null>(null);
  const [showTimeline, setShowTimeline] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [userConsentsState, setUserConsentsState] = useState<ConsentRequest[]>([]);

  // Sincronizar estado local com as props quando elas mudarem
  useEffect(() => {
    if (isAuthenticated && loggedUserCpf) {
      const filteredConsents = consents.filter(consent => 
        consent.cpf.replace(/\D/g, '') === loggedUserCpf.replace(/\D/g, '')
      );
      setUserConsentsState(filteredConsents);
    }
  }, [consents, isAuthenticated, loggedUserCpf]);

  const handleLogin = (name: string, cpf: string) => {
    setLoggedUserName(name);
    setLoggedUserCpf(cpf);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoggedUserName('');
    setLoggedUserCpf('');
    setExpandedConsent(null);
    setShowTimeline(false);
    setActiveFilter('all');
    setUserConsentsState([]);
  };

  const handleApprove = (consentId: string) => {
    // Chama a função passada como prop se existir
    if (onApprove) {
      onApprove(consentId);
    }
    
    // Atualiza o estado local também para feedback imediato
    setUserConsentsState(prev => prev.map(consent => {
      if (consent.id === consentId) {
        const updatedConsent = {
          ...consent,
          status: 'approved' as const,
          approvedAt: new Date(),
          lastModified: new Date(),
          actionHistory: [
            ...consent.actionHistory,
            {
              id: `action-${Date.now()}`,
              action: 'approved' as const,
              timestamp: new Date(),
              performedBy: 'user' as const,
              reason: 'Consentimento aprovado pelo titular dos dados'
            }
          ]
        };
        return updatedConsent;
      }
      return consent;
    }));
  };

  const handleRevoke = (consentId: string) => {
    // Chama a função passada como prop se existir
    if (onRevoke) {
      onRevoke(consentId);
    }
    
    // Atualiza o estado local também para feedback imediato
    setUserConsentsState(prev => prev.map(consent => {
      if (consent.id === consentId) {
        const updatedConsent = {
          ...consent,
          status: 'rejected' as const,
          revokedAt: new Date(),
          lastModified: new Date(),
          actionHistory: [
            ...consent.actionHistory,
            {
              id: `action-${Date.now()}`,
              action: 'revoked' as const,
              timestamp: new Date(),
              performedBy: 'user' as const,
              reason: 'Consentimento revogado pelo titular dos dados'
            }
          ]
        };
        return updatedConsent;
      }
      return consent;
    }));
  };

  const handleFilterClick = (filter: 'all' | 'approved' | 'pending' | 'rejected') => {
    setActiveFilter(filter);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string, revokedAt?: Date) => {
    if (revokedAt) {
      return <Badge className="bg-red-100 text-red-800 border border-red-200">Revogado</Badge>;
    }
    
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border border-green-200">Aprovado</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border border-red-200">Rejeitado</Badge>;
      default:
        return <Badge className="bg-amber-100 text-amber-800 border border-amber-200">Pendente</Badge>;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'revoked':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionLabel = (action: string) => {
    const labels = {
      created: 'Solicitação criada',
      approved: 'Consentimento aprovado',
      rejected: 'Consentimento rejeitado',
      revoked: 'Consentimento revogado'
    };
    return labels[action as keyof typeof labels] || action;
  };

  // Se não estiver autenticado, mostrar tela de login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4 mx-auto">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Portal do Titular
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Acesse seus consentimentos de dados com segurança
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
                <input
                  type="text"
                  placeholder="Digite seu nome completo"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  onChange={(e) => setLoggedUserName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CPF</label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                  onChange={(e) => setLoggedUserCpf(e.target.value)}
                />
              </div>
            </div>
            <Button 
              onClick={() => handleLogin(loggedUserName, loggedUserCpf)}
              disabled={!loggedUserName || !loggedUserCpf}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-lg font-medium transition-all transform hover:scale-105 disabled:transform-none disabled:opacity-50"
            >
              <Shield className="h-4 w-4 mr-2" />
              Entrar com gov.br
            </Button>
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Simulação de autenticação gov.br para demonstração
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Usar o estado local se disponível, senão usar as props
  const userConsents = userConsentsState.length > 0 ? userConsentsState : 
    consents.filter(consent => consent.cpf.replace(/\D/g, '') === loggedUserCpf.replace(/\D/g, ''));

  const activeConsents = userConsents.filter(c => c.status === 'approved' && !c.revokedAt);
  const pendingConsents = userConsents.filter(c => c.status === 'pending');
  const revokedConsents = userConsents.filter(c => c.status === 'rejected' || c.revokedAt);

  // Filtrar consentimentos baseado no filtro ativo
  const getFilteredConsents = () => {
    switch (activeFilter) {
      case 'approved':
        return activeConsents;
      case 'pending':
        return pendingConsents;
      case 'rejected':
        return revokedConsents;
      default:
        return userConsents;
    }
  };

  const filteredConsents = getFilteredConsents();

  // Criar timeline de todas as ações
  const allActions = userConsents.flatMap(consent => 
    consent.actionHistory.map(action => ({
      ...action,
      consentId: consent.id,
      dataUser: consent.dataUser
    }))
  ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header do usuário */}
        <Card className="shadow-xl border-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">{loggedUserName}</h1>
                  <div className="flex items-center gap-4 text-blue-100">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <span className="font-mono">CPF: {loggedUserCpf}</span>
                    </div>
                    <Badge className="bg-green-500/20 text-green-100 border-green-300/30">
                      <Shield className="h-3 w-3 mr-1" />
                      Autenticado via gov.br
                    </Badge>
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleLogout} 
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                size="lg"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resumo Estatístico */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card 
            className={`cursor-pointer transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 border-0 shadow-lg ${
              activeFilter === 'approved' ? 'ring-2 ring-green-500 bg-gradient-to-br from-green-50 to-green-100' : 'bg-gradient-to-br from-green-50 to-green-100'
            }`}
            onClick={() => handleFilterClick('approved')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-green-700 mb-1">{activeConsents.length}</p>
                  <p className="text-sm font-medium text-green-600">Consentimentos Ativos</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-500">Aprovados e válidos</span>
                  </div>
                </div>
                <div className="bg-green-200 p-3 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 border-0 shadow-lg ${
              activeFilter === 'pending' ? 'ring-2 ring-yellow-500 bg-gradient-to-br from-yellow-50 to-yellow-100' : 'bg-gradient-to-br from-yellow-50 to-yellow-100'
            }`}
            onClick={() => handleFilterClick('pending')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-yellow-700 mb-1">{pendingConsents.length}</p>
                  <p className="text-sm font-medium text-yellow-600">Aguardando Decisão</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Clock className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs text-yellow-500">Requer sua ação</span>
                  </div>
                </div>
                <div className="bg-yellow-200 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-yellow-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 border-0 shadow-lg ${
              activeFilter === 'rejected' ? 'ring-2 ring-red-500 bg-gradient-to-br from-red-50 to-red-100' : 'bg-gradient-to-br from-red-50 to-red-100'
            }`}
            onClick={() => handleFilterClick('rejected')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-red-700 mb-1">{revokedConsents.length}</p>
                  <p className="text-sm font-medium text-red-600">Rejeitados/Revogados</p>
                  <div className="flex items-center gap-1 mt-2">
                    <XCircle className="h-3 w-3 text-red-500" />
                    <span className="text-xs text-red-500">Sem acesso ativo</span>
                  </div>
                </div>
                <div className="bg-red-200 p-3 rounded-full">
                  <XCircle className="h-6 w-6 text-red-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 border-0 shadow-lg ${
              showTimeline ? 'ring-2 ring-purple-500 bg-gradient-to-br from-purple-50 to-purple-100' : 'bg-gradient-to-br from-purple-50 to-purple-100'
            }`}
            onClick={() => setShowTimeline(!showTimeline)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-purple-700 mb-1">{allActions.length}</p>
                  <p className="text-sm font-medium text-purple-600">Atividades Recentes</p>
                  <div className="flex items-center gap-1 mt-2">
                    <BarChart3 className="h-3 w-3 text-purple-500" />
                    <span className="text-xs text-purple-500">Ver histórico</span>
                  </div>
                </div>
                <div className="bg-purple-200 p-3 rounded-full">
                  <History className="h-6 w-6 text-purple-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline de Atividades */}
        <Card className={`transition-all duration-500 border-0 shadow-lg ${showTimeline ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
          {showTimeline && (
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <History className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Timeline de Atividades</h3>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowTimeline(false)}
                  className="border-gray-300"
                >
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Ocultar
                </Button>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {allActions.map((action, index) => (
                  <div key={action.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      {getActionIcon(action.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {getActionLabel(action.action)}
                        </p>
                        <Badge variant="outline" className="text-xs font-mono">
                          #{action.consentId.slice(0, 8)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-1">{action.dataUser}</p>
                      {action.reason && (
                        <p className="text-xs text-gray-600 bg-white px-2 py-1 rounded">{action.reason}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {action.timestamp.toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Lista de Consentimentos */}
        <div className="space-y-8">
          {activeFilter === 'all' && (
            <>
              {/* Consentimentos Ativos */}
              {activeConsents.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-green-100 p-2 rounded-full">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Consentimentos Ativos ({activeConsents.length})
                    </h2>
                  </div>
                  <div className="grid gap-6">
                    {activeConsents.map((consent, index) => (
                      <ConsentCard 
                         key={consent.id} 
                         consent={consent} 
                         expandedConsent={expandedConsent}
                         setExpandedConsent={setExpandedConsent}
                         getStatusIcon={getStatusIcon}
                         getStatusBadge={getStatusBadge}
                         getActionIcon={getActionIcon}
                         getActionLabel={getActionLabel}
                         onApprove={handleApprove}
                         onRevoke={handleRevoke}
                         index={index}
                       />
                    ))}
                  </div>
                </div>
              )}

              {/* Consentimentos Pendentes */}
              {pendingConsents.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-yellow-100 p-2 rounded-full">
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Consentimentos Pendentes ({pendingConsents.length})
                    </h2>
                  </div>
                  <div className="grid gap-6">
                    {pendingConsents.map((consent, index) => (
                      <ConsentCard 
                        key={consent.id} 
                        consent={consent} 
                        expandedConsent={expandedConsent}
                        setExpandedConsent={setExpandedConsent}
                        getStatusIcon={getStatusIcon}
                        getStatusBadge={getStatusBadge}
                        getActionIcon={getActionIcon}
                        getActionLabel={getActionLabel}
                        onApprove={handleApprove}
                        onRevoke={handleRevoke}
                        index={index}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Consentimentos Rejeitados/Revogados */}
              {revokedConsents.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-red-100 p-2 rounded-full">
                      <XCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Consentimentos Rejeitados/Revogados ({revokedConsents.length})
                    </h2>
                  </div>
                  <div className="grid gap-6">
                    {revokedConsents.map((consent, index) => (
                      <ConsentCard 
                        key={consent.id} 
                        consent={consent} 
                        expandedConsent={expandedConsent}
                        setExpandedConsent={setExpandedConsent}
                        getStatusIcon={getStatusIcon}
                        getStatusBadge={getStatusBadge}
                        getActionIcon={getActionIcon}
                        getActionLabel={getActionLabel}
                        onApprove={handleApprove}
                        onRevoke={handleRevoke}
                        index={index}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Lista Filtrada */}
          {activeFilter !== 'all' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {activeFilter === 'approved' && <div className="bg-green-100 p-2 rounded-full"><CheckCircle className="h-5 w-5 text-green-600" /></div>}
                  {activeFilter === 'pending' && <div className="bg-yellow-100 p-2 rounded-full"><Clock className="h-5 w-5 text-yellow-600" /></div>}
                  {activeFilter === 'rejected' && <div className="bg-red-100 p-2 rounded-full"><XCircle className="h-5 w-5 text-red-600" /></div>}
                  <h2 className="text-2xl font-bold text-gray-900">
                    {activeFilter === 'approved' && `Consentimentos Ativos (${filteredConsents.length})`}
                    {activeFilter === 'pending' && `Consentimentos Pendentes (${filteredConsents.length})`}
                    {activeFilter === 'rejected' && `Consentimentos Rejeitados/Revogados (${filteredConsents.length})`}
                  </h2>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => handleFilterClick('all')}
                  className="border-gray-300"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Mostrar Todos
                </Button>
              </div>
              <div className="grid gap-6">
                {filteredConsents.map((consent, index) => (
                  <ConsentCard 
                    key={consent.id} 
                    consent={consent} 
                    expandedConsent={expandedConsent}
                    setExpandedConsent={setExpandedConsent}
                    getStatusIcon={getStatusIcon}
                    getStatusBadge={getStatusBadge}
                    getActionIcon={getActionIcon}
                    getActionLabel={getActionLabel}
                    onApprove={handleApprove}
                    onRevoke={handleRevoke}
                    index={index}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {userConsents.length === 0 && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100">
            <CardContent className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full mb-6">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Nenhum consentimento encontrado</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Você ainda não possui solicitações de consentimento para seus dados pessoais
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

// Componente para cada cartão de consentimento
const ConsentCard: React.FC<{
  consent: ConsentRequest;
  expandedConsent: string | null;
  setExpandedConsent: (id: string | null) => void;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusBadge: (status: string, revokedAt?: Date) => React.ReactNode;
  getActionIcon: (action: string) => React.ReactNode;
  getActionLabel: (action: string) => string;
  onApprove?: (id: string) => void;
  onRevoke?: (id: string) => void;
  index: number;
}> = ({ 
  consent, 
  expandedConsent, 
  setExpandedConsent, 
  getStatusIcon, 
  getStatusBadge,
  getActionIcon,
  getActionLabel,
  onApprove,
  onRevoke,
  index
}) => {
  const isExpanded = expandedConsent === consent.id;

  const getStatusConfig = (status: string, revokedAt?: Date) => {
    return {
      bgGradient: 'bg-gray-50',
      borderColor: 'border-gray-200'
    };
  };

  const statusConfig = getStatusConfig(consent.status, consent.revokedAt);

  return (
    <Card 
      className={`border ${statusConfig.borderColor} shadow-lg ${statusConfig.bgGradient} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              {getStatusIcon(consent.status)}
              <div>
                <CardTitle className="text-xl font-bold text-gray-900 mb-1">
                  {consent.dataUser}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {getStatusBadge(consent.status, consent.revokedAt)}
                  <Badge className="bg-gray-100 text-gray-700 border border-gray-200 flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    {consent.dataUserType.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </div>
            
            <p className="text-gray-700 font-medium mb-4 bg-gray-100 border border-gray-200 p-3 rounded-lg">
              {consent.purpose}
            </p>
            
            {/* Quick Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div className="flex items-center gap-2 p-2 bg-gray-100 border border-gray-200 rounded">
                <Building className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500">Controlador</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">{consent.controller}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-100 border border-gray-200 rounded">
                <Calendar className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500">Validade</p>
                  <p className="text-sm font-semibold text-gray-900">{consent.deadline}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-100 border border-gray-200 rounded">
                <Database className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500">Tipos de Dados</p>
                  <p className="text-sm font-semibold text-gray-900">{consent.dataTypes.length} tipos</p>
                </div>
              </div>
            </div>
            
            {/* Botões de Ação */}
            <div className="flex flex-wrap gap-3">
              {consent.status === 'pending' && onApprove && (
                <Button
                  onClick={() => onApprove(consent.id)}
                  className="bg-green-600 hover:bg-green-700 text-white shadow-lg border border-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aprovar Consentimento
                </Button>
              )}
              {consent.status === 'approved' && !consent.revokedAt && onRevoke && (
                <Button
                  onClick={() => onRevoke(consent.id)}
                  className="bg-red-600 hover:bg-red-700 text-white shadow-lg border border-red-700"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Revogar Consentimento
                </Button>
              )}
              {(consent.status === 'rejected' || consent.revokedAt) && (
                <Badge className="bg-gray-200 text-gray-700 px-4 py-2 text-sm border border-gray-300">
                  <XCircle className="h-4 w-4 mr-2" />
                  {consent.revokedAt ? 
                    `Revogado em ${consent.revokedAt.toLocaleDateString('pt-BR')}` :
                    `Rejeitado em ${consent.rejectedAt?.toLocaleDateString('pt-BR') || 'Data não disponível'}`
                  }
                </Badge>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpandedConsent(isExpanded ? null : consent.id)}
            className="ml-4 bg-white/50 hover:bg-white/80"
          >
            <Eye className="h-4 w-4 mr-2" />
            {isExpanded ? 'Ocultar' : 'Detalhes'}
            {isExpanded ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <Separator className="mb-6 bg-white/50" />
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informações Gerais */}
              <Card className="bg-white/60 border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm text-gray-800">
                    <FileText className="h-4 w-4 text-blue-600" />
                    Informações Gerais
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">ID do Consentimento</p>
                    <p className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">#{consent.id.slice(0, 8)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Base Legal (LGPD)</p>
                    <p className="text-sm text-gray-700">{consent.legalBasis}</p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Dados Solicitados */}
              <Card className="bg-white/60 border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm text-gray-800">
                    <Database className="h-4 w-4 text-purple-600" />
                    Dados Solicitados
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    {consent.dataTypes.map((type, index) => (
                      <Badge key={index} className="bg-purple-100 text-purple-800 border border-purple-200 text-xs px-2 py-1">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Token JWT (se aprovado) */}
            {consent.status === 'approved' && consent.tokenId && (
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Token de Acesso Ativo
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Key className="h-4 w-4 text-green-600" />
                      <p className="text-sm font-semibold text-green-800">Token JWT</p>
                    </div>
                    <div className="bg-white/80 rounded-lg p-3 border border-green-200">
                      <code className="block text-xs font-mono text-gray-700 break-all">
                        {consent.tokenId}
                      </code>
                    </div>
                  </div>
                  
                  {consent.scopes && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Lock className="h-4 w-4 text-green-600" />
                        <p className="text-sm font-semibold text-green-800">Escopos Autorizados</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {consent.scopes.map((scope) => (
                          <Badge key={scope} className="bg-green-200 text-green-800 border border-green-300 text-xs font-mono px-2 py-1">
                            <Zap className="h-3 w-3 mr-1" />
                            {scope}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-700">
                        Este token permite acesso aos seus dados conforme os escopos autorizados. 
                        Válido até <strong>{consent.deadline}</strong>. Você pode revogar a qualquer momento.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Histórico de Ações */}
            <Card className="bg-white/60 border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm text-gray-800">
                  <History className="h-4 w-4 text-indigo-600" />
                  Histórico de Ações
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {consent.actionHistory.map((action) => (
                    <div key={action.id} className="flex items-start space-x-3 p-3 bg-white/50 rounded-lg">
                      {getActionIcon(action.action)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-semibold text-gray-900">{getActionLabel(action.action)}</span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {action.performedBy === 'user' ? 'Usuário' : 'Sistema'}
                          </span>
                        </div>
                        {action.reason && (
                          <p className="text-xs text-gray-600 mb-2 bg-blue-50 px-2 py-1 rounded">{action.reason}</p>
                        )}
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {action.timestamp.toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Metadados */}
            <div className="flex items-center justify-between text-xs text-gray-500 bg-white/50 p-3 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Criado: {consent.createdAt.toLocaleDateString('pt-BR')}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  <span>Modificado: {consent.lastModified.toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default DataOwnerConsents;