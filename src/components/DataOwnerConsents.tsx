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
  ChevronUp
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
  status: 'pending' | 'approved' | 'rejected';
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

  const handleGovBrLogin = () => {
    // Simulação do login gov.br
    setLoggedUserName('João da Silva Santos');
    setLoggedUserCpf('123.456.789-00');
    setIsAuthenticated(true);
    
    // Filtrar consentimentos do usuário logado
    const filteredConsents = consents.filter(consent => 
      consent.cpf.replace(/\D/g, '') === '123.456.789-00'.replace(/\D/g, '')
    );
    setUserConsentsState(filteredConsents);
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
          // Mantém o status como approved mas marca como revogado
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
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string, revokedAt?: Date) => {
    const variants = {
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      revoked: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    
    const labels = {
      approved: 'Aprovado',
      rejected: 'Rejeitado',
      revoked: 'Revogado',
      pending: 'Pendente'
    };

    // Se foi revogado, mostrar como revogado independente do status
    const effectiveStatus = revokedAt ? 'revoked' : status;

    return (
      <Badge className={variants[effectiveStatus as keyof typeof variants]}>
        {labels[effectiveStatus as keyof typeof labels]}
      </Badge>
    );
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <FileText className="h-3 w-3" />;
      case 'approved':
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-3 w-3 text-red-600" />;
      case 'revoked':
        return <XCircle className="h-3 w-3 text-orange-600" />;
      default:
        return <Clock className="h-3 w-3" />;
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

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="h-12 w-12 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Acesso gov.br
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Faça login com sua conta gov.br para visualizar seus consentimentos
            </p>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleGovBrLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              <User className="h-4 w-4 mr-2" />
              Entrar com gov.br
            </Button>
            <p className="text-xs text-gray-500 mt-4 text-center">
              Acesso seguro através da plataforma oficial do governo brasileiro
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filtrar consentimentos do usuário logado
  const userConsents = userConsentsState.length > 0 ? userConsentsState : consents.filter(consent => 
    consent.cpf.replace(/\D/g, '') === loggedUserCpf.replace(/\D/g, '')
  );

  // Filtrar consentimentos por categoria
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
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header do usuário */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{loggedUserName}</h2>
                <p className="text-gray-600">CPF: {loggedUserCpf}</p>
                <Badge className="bg-green-100 text-green-800 mt-1">
                  <Shield className="h-3 w-3 mr-1" />
                  Autenticado via gov.br
                </Badge>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline">
              Sair
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${
            activeFilter === 'approved' ? 'ring-2 ring-green-500 bg-green-50' : ''
          }`}
          onClick={() => handleFilterClick('approved')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">{activeConsents.length}</p>
                <p className="text-sm text-gray-600">Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${
            activeFilter === 'pending' ? 'ring-2 ring-yellow-500 bg-yellow-50' : ''
          }`}
          onClick={() => handleFilterClick('pending')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">{pendingConsents.length}</p>
                <p className="text-sm text-gray-600">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${
            activeFilter === 'rejected' ? 'ring-2 ring-red-500 bg-red-50' : ''
          }`}
          onClick={() => handleFilterClick('rejected')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">{revokedConsents.length}</p>
                <p className="text-sm text-gray-600">Rejeitados/Revogados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${
            activeFilter === 'all' ? 'ring-2 ring-blue-500 bg-blue-50' : ''
          }`}
          onClick={() => handleFilterClick('all')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <History className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{userConsents.length}</p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline de Ações */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <History className="h-5 w-5" />
              <span>Histórico de Ações</span>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTimeline(!showTimeline)}
            >
              {showTimeline ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {showTimeline ? 'Ocultar' : 'Mostrar'} Timeline
            </Button>
          </div>
        </CardHeader>
        {showTimeline && (
          <CardContent>
            <div className="space-y-4">
              {allActions.map((action, index) => (
                <div key={action.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getActionIcon(action.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900">
                        {getActionLabel(action.action)}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {action.consentId}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{action.dataUser}</p>
                    {action.reason && (
                      <p className="text-xs text-gray-500 mt-1">{action.reason}</p>
                    )}
                    <p className="text-xs text-gray-400">
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
      <div className="space-y-6">
        {activeFilter === 'all' && (
          <>
            {/* Consentimentos Ativos */}
            {activeConsents.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  Consentimentos Ativos ({activeConsents.length})
                </h3>
                <div className="space-y-4">
                  {activeConsents.map((consent) => (
                    <ConsentCard 
                       key={consent.id} 
                       consent={consent} 
                       expandedConsent={expandedConsent}
                       setExpandedConsent={setExpandedConsent}
                       getStatusIcon={getStatusIcon}
                       getStatusBadge={getStatusBadge}
                       getActionIcon={getActionIcon}
                       getActionLabel={getActionLabel}
                       onApprove={onApprove}
                       onRevoke={onRevoke}
                     />
                  ))}
                </div>
              </div>
            )}

            {/* Consentimentos Pendentes */}
            {pendingConsents.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                  Consentimentos Pendentes ({pendingConsents.length})
                </h3>
                <div className="space-y-4">
                  {pendingConsents.map((consent) => (
                    <ConsentCard 
                      key={consent.id} 
                      consent={consent} 
                      expandedConsent={expandedConsent}
                      setExpandedConsent={setExpandedConsent}
                      getStatusIcon={getStatusIcon}
                      getStatusBadge={getStatusBadge}
                      getActionIcon={getActionIcon}
                      getActionLabel={getActionLabel}
                      onApprove={onApprove}
                      onRevoke={onRevoke}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Consentimentos Rejeitados/Revogados */}
            {revokedConsents.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <XCircle className="h-5 w-5 text-red-600 mr-2" />
                  Consentimentos Rejeitados/Revogados ({revokedConsents.length})
                </h3>
                <div className="space-y-4">
                  {revokedConsents.map((consent) => (
                    <ConsentCard 
                      key={consent.id} 
                      consent={consent} 
                      expandedConsent={expandedConsent}
                      setExpandedConsent={setExpandedConsent}
                      getStatusIcon={getStatusIcon}
                      getStatusBadge={getStatusBadge}
                      getActionIcon={getActionIcon}
                      getActionLabel={getActionLabel}
                      onApprove={onApprove}
                      onRevoke={onRevoke}
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                {activeFilter === 'approved' && <CheckCircle className="h-5 w-5 text-green-600 mr-2" />}
                {activeFilter === 'pending' && <Clock className="h-5 w-5 text-yellow-600 mr-2" />}
                {activeFilter === 'rejected' && <XCircle className="h-5 w-5 text-red-600 mr-2" />}
                {activeFilter === 'approved' && `Consentimentos Ativos (${filteredConsents.length})`}
                {activeFilter === 'pending' && `Consentimentos Pendentes (${filteredConsents.length})`}
                {activeFilter === 'rejected' && `Consentimentos Rejeitados/Revogados (${filteredConsents.length})`}
              </h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleFilterClick('all')}
              >
                Mostrar Todos
              </Button>
            </div>
            <div className="space-y-4">
              {filteredConsents.map((consent) => (
                <ConsentCard 
                  key={consent.id} 
                  consent={consent} 
                  expandedConsent={expandedConsent}
                  setExpandedConsent={setExpandedConsent}
                  getStatusIcon={getStatusIcon}
                  getStatusBadge={getStatusBadge}
                  getActionIcon={getActionIcon}
                  getActionLabel={getActionLabel}
                  onApprove={onApprove}
                  onRevoke={onRevoke}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {userConsents.length === 0 && (
        <Alert>
          <AlertDescription>
            Nenhum consentimento encontrado para este usuário.
          </AlertDescription>
        </Alert>
      )}
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
}> = ({ 
  consent, 
  expandedConsent, 
  setExpandedConsent, 
  getStatusIcon, 
  getStatusBadge,
  getActionIcon,
  getActionLabel,
  onApprove,
  onRevoke
}) => {
  const isExpanded = expandedConsent === consent.id;

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              {getStatusIcon(consent.status)}
              <CardTitle className="text-lg">{consent.dataUser}</CardTitle>
              {getStatusBadge(consent.status, consent.revokedAt)}
            </div>
            <p className="text-sm text-gray-600 mb-2">{consent.dataUserType}</p>
            <p className="text-sm text-gray-700 mb-3">{consent.purpose}</p>
            
            {/* Botões de Ação */}
            <div className="flex space-x-2">
              {consent.status === 'pending' && onApprove && (
                <Button
                  size="sm"
                  onClick={() => onApprove(consent.id)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Aprovar
                </Button>
              )}
              {consent.status === 'approved' && !consent.revokedAt && onRevoke && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onRevoke(consent.id)}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Revogar
                </Button>
              )}
              {(consent.status === 'rejected' || consent.revokedAt) && (
                <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                  <XCircle className="h-3 w-3 mr-1" />
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
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          <div className="space-y-4">
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-sm text-gray-900 mb-2">Informações Gerais</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">ID:</span> {consent.id}</p>
                  <p><span className="font-medium">Controlador:</span> {consent.controller}</p>
                  <p><span className="font-medium">Base Legal:</span> {consent.legalBasis}</p>
                  <p><span className="font-medium">Prazo:</span> {consent.deadline}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm text-gray-900 mb-2">Dados Solicitados</h4>
                <div className="flex flex-wrap gap-1">
                  {consent.dataTypes.map((type, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-gray-900 mb-2">Histórico de Ações</h4>
              <div className="space-y-2">
                {consent.actionHistory.map((action) => (
                  <div key={action.id} className="flex items-start space-x-2 text-sm">
                    {getActionIcon(action.action)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{getActionLabel(action.action)}</span>
                        <span className="text-gray-500">
                          {action.timestamp.toLocaleString('pt-BR')}
                        </span>
                      </div>
                      {action.reason && (
                        <p className="text-gray-600 text-xs mt-1">{action.reason}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              <span>Criado em: {consent.createdAt.toLocaleDateString('pt-BR')}</span>
              <span>•</span>
              <span>Última modificação: {consent.lastModified.toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default DataOwnerConsents;