import React, { useState, useEffect, useCallback } from 'react';
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
  const { user } = useAuth();
  const [consents, setConsents] = useState<ConsentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedConsent, setExpandedConsent] = useState<string | null>(null);

  const loadConsents = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const userConsents = await db.getConsentsByCpf(user.email);
      setConsents(userConsents);
    } catch (error) {
      console.error('Erro ao carregar consentimentos:', error);
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
      pending: 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status === 'approved' ? 'Aprovado' : 
         status === 'rejected' ? 'Rejeitado' : 
         status === 'pending' ? 'Pendente' : status}
      </Badge>
    );
  };

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
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Meus Consentimentos de Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {consents.length === 0 ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Você ainda não possui consentimentos registrados.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {consents.map((consent) => (
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