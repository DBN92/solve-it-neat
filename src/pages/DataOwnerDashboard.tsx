import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
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
  Building,
  Database,
  Key,
  Lock,
  Zap,
  TrendingUp,
  BarChart3,
  CreditCard,
  Home,
  Settings
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

const DataOwnerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [consents, setConsents] = useState<ConsentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedConsent, setExpandedConsent] = useState<string | null>(null);

  // Carregar consentimentos do usuário logado
  useEffect(() => {
    const loadUserConsents = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        // Filtrar consentimentos onde o usuário é o dono dos dados
        const allConsents = await db.consents.getConsents();
        const userConsents = allConsents.filter(consent => 
          consent.dataOwner === user.name || 
          consent.cpf === user.email.replace('@gov.br', '') // Assumindo que CPF pode estar relacionado ao email
        );
        setConsents(userConsents);
      } catch (error) {
        console.error("Erro ao carregar consentimentos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserConsents();
  }, [user]);

  const handleApprove = async (consentId: string) => {
    try {
      // Simular aprovação do consentimento
      setConsents(prev => prev.map(consent => 
        consent.id === consentId 
          ? { 
              ...consent, 
              status: 'approved' as const,
              approvedAt: new Date(),
              lastModified: new Date(),
              actionHistory: [
                ...consent.actionHistory,
                {
                  id: `action_${Date.now()}`,
                  action: 'approved' as const,
                  timestamp: new Date(),
                  performedBy: 'user' as const,
                  reason: 'Aprovado pelo dono dos dados'
                }
              ]
            }
          : consent
      ));
    } catch (error) {
      console.error("Erro ao aprovar consentimento:", error);
    }
  };

  const handleReject = async (consentId: string) => {
    try {
      // Simular rejeição do consentimento
      setConsents(prev => prev.map(consent => 
        consent.id === consentId 
          ? { 
              ...consent, 
              status: 'rejected' as const,
              rejectedAt: new Date(),
              lastModified: new Date(),
              actionHistory: [
                ...consent.actionHistory,
                {
                  id: `action_${Date.now()}`,
                  action: 'rejected' as const,
                  timestamp: new Date(),
                  performedBy: 'user' as const,
                  reason: 'Rejeitado pelo dono dos dados'
                }
              ]
            }
          : consent
      ));
    } catch (error) {
      console.error("Erro ao rejeitar consentimento:", error);
    }
  };

  const handleRevoke = async (consentId: string) => {
    try {
      // Simular revogação do consentimento
      setConsents(prev => prev.map(consent => 
        consent.id === consentId 
          ? { 
              ...consent, 
              revokedAt: new Date(),
              lastModified: new Date(),
              actionHistory: [
                ...consent.actionHistory,
                {
                  id: `action_${Date.now()}`,
                  action: 'revoked' as const,
                  timestamp: new Date(),
                  performedBy: 'user' as const,
                  reason: 'Revogado pelo dono dos dados'
                }
              ]
            }
          : consent
      ));
    } catch (error) {
      console.error("Erro ao revogar consentimento:", error);
    }
  };

  const getStatusIcon = (status: string, revokedAt?: Date) => {
    if (revokedAt) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
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
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-200">Pendente</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border border-gray-200">Desconhecido</Badge>;
    }
  };

  const pendingConsents = consents.filter(c => c.status === 'pending' && !c.revokedAt);
  const approvedConsents = consents.filter(c => c.status === 'approved' && !c.revokedAt);
  const rejectedConsents = consents.filter(c => c.status === 'rejected' && !c.revokedAt);
  const revokedConsents = consents.filter(c => c.revokedAt);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando seus consentimentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Logo />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Meus Consentimentos</h1>
              <p className="text-sm text-gray-600">Gerencie suas autorizações de dados pessoais</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-600">Dono de Dados</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <User className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendentes</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingConsents.length}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aprovados</p>
                  <p className="text-2xl font-bold text-green-600">{approvedConsents.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejeitados</p>
                  <p className="text-2xl font-bold text-red-600">{rejectedConsents.length}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{consents.length}</p>
                </div>
                <FileText className="w-8 h-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Consents List */}
        {consents.length === 0 ? (
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-12 text-center">
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum consentimento encontrado</h3>
              <p className="text-gray-600">
                Você ainda não possui solicitações de consentimento para seus dados pessoais.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {consents.map((consent, index) => (
              <Card key={consent.id} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      {getStatusIcon(consent.status, consent.revokedAt)}
                      <div>
                        <h3 className="font-medium text-gray-900">{consent.dataUser}</h3>
                        <p className="text-sm text-gray-600">{consent.purpose}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(consent.status, consent.revokedAt)}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedConsent(expandedConsent === consent.id ? null : consent.id)}
                      >
                        {expandedConsent === consent.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {expandedConsent === consent.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Tipos de Dados</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {consent.dataTypes.map((type, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Base Legal</p>
                          <p className="text-sm text-gray-600 mt-1">{consent.legalBasis}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Controlador</p>
                          <p className="text-sm text-gray-600 mt-1">{consent.controller}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Prazo</p>
                          <p className="text-sm text-gray-600 mt-1">{consent.deadline}</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {consent.status === 'pending' && !consent.revokedAt && (
                        <div className="flex space-x-2 mt-4">
                          <Button
                            onClick={() => handleApprove(consent.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            size="sm"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Aprovar
                          </Button>
                          <Button
                            onClick={() => handleReject(consent.id)}
                            variant="destructive"
                            size="sm"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Rejeitar
                          </Button>
                        </div>
                      )}

                      {consent.status === 'approved' && !consent.revokedAt && (
                        <div className="flex space-x-2 mt-4">
                          <Button
                            onClick={() => handleRevoke(consent.id)}
                            variant="outline"
                            size="sm"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
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
      </main>
    </div>
  );
};

export default DataOwnerDashboard;