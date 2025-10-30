import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConsentRequest } from "@/pages/Index";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Key, 
  FileCheck, 
  Calendar, 
  User, 
  Building, 
  Database, 
  CreditCard,
  ChevronDown,
  ChevronUp,
  Shield,
  AlertTriangle,
  Award,
  Eye,
  Lock,
  Zap,
  FileText,
  Users,
  Activity
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ConsentListProps {
  consents: ConsentRequest[];
}

const ConsentList = ({ consents }: ConsentListProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          icon: CheckCircle2,
          label: 'Aprovado',
          bgGradient: 'bg-gray-50',
          iconBg: 'bg-gray-100',
          iconColor: 'text-green-600',
          badgeClass: 'bg-green-100 text-green-800 border border-green-200',
          borderColor: 'border-gray-200'
        };
      case 'rejected':
        return {
          icon: XCircle,
          label: 'Rejeitado',
          bgGradient: 'bg-gray-50',
          iconBg: 'bg-gray-100',
          iconColor: 'text-red-600',
          badgeClass: 'bg-red-100 text-red-800 border border-red-200',
          borderColor: 'border-gray-200'
        };
      default:
        return {
          icon: Clock,
          label: 'Pendente',
          bgGradient: 'bg-gray-50',
          iconBg: 'bg-gray-100',
          iconColor: 'text-amber-600',
          badgeClass: 'bg-amber-100 text-amber-800 border border-amber-200',
          borderColor: 'border-gray-200'
        };
    }
  };

  const getUserTypeConfig = (userType: string) => {
    const configs = {
      'empresa': { icon: Building, color: 'bg-gray-100 text-gray-700 border border-gray-200' },
      'pessoa_fisica': { icon: User, color: 'bg-gray-100 text-gray-700 border border-gray-200' },
      'orgao_publico': { icon: Shield, color: 'bg-gray-100 text-gray-700 border border-gray-200' },
      'default': { icon: Users, color: 'bg-gray-100 text-gray-700 border border-gray-200' }
    };
    return configs[userType as keyof typeof configs] || configs.default;
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 border border-gray-200 rounded-full mb-4">
          <FileText className="h-8 w-8 text-gray-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Lista de Consentimentos
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Gerencie e visualize todos os consentimentos de dados com detalhes completos
        </p>
      </div>

      {consents.map((consent, index) => {
        const statusConfig = getStatusConfig(consent.status);
        const userTypeConfig = getUserTypeConfig(consent.dataUserType);
        const StatusIcon = statusConfig.icon;
        const UserTypeIcon = userTypeConfig.icon;
        const isExpanded = expandedId === consent.id;

        return (
          <Card 
            key={consent.id} 
            className={`overflow-hidden shadow-sm border ${statusConfig.borderColor} bg-white hover:shadow-md transition-all duration-200`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <Collapsible open={isExpanded} onOpenChange={(open) => setExpandedId(open ? consent.id : null)}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Status Icon */}
                    <div className={`p-3 ${statusConfig.iconBg} rounded-lg border border-gray-200`}>
                      <StatusIcon className={`h-6 w-6 ${statusConfig.iconColor}`} />
                    </div>

                    {/* Main Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">#{consent.id.slice(0, 8)}</h3>
                        <Badge className={`${statusConfig.badgeClass} px-3 py-1 rounded-md`}>
                          {statusConfig.label}
                        </Badge>
                        <Badge className={`${userTypeConfig.color} px-3 py-1 rounded-md flex items-center gap-1`}>
                          <UserTypeIcon className="h-3 w-3" />
                          {consent.dataUserType.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-gray-700 font-medium mb-3">{consent.purpose}</p>

                      {/* Quick Info Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <Building className="h-4 w-4 text-gray-600" />
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Solicitante</p>
                            <p className="text-sm font-semibold text-gray-900 truncate">{consent.dataUser}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <User className="h-4 w-4 text-gray-600" />
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Titular</p>
                            <p className="text-sm font-semibold text-gray-900 truncate">{consent.dataOwner}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <CreditCard className="h-4 w-4 text-gray-600" />
                          <div>
                            <p className="text-xs text-gray-500 font-medium">CPF</p>
                            <p className="text-sm font-semibold text-gray-900 font-mono">{consent.cpf}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <Calendar className="h-4 w-4 text-gray-600" />
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Validade</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {new Date(consent.deadline).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Data Types */}
                      <div className="mt-4 flex items-center gap-2">
                        <Database className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Tipos de Dados:</span>
                        <div className="flex flex-wrap gap-2">
                          {consent.dataTypes.slice(0, 3).map((type) => (
                            <Badge key={type} className="bg-gray-100 text-gray-700 border border-gray-200 text-xs px-2 py-1">
                              {type}
                            </Badge>
                          ))}
                          {consent.dataTypes.length > 3 && (
                            <Badge className="bg-gray-200 text-gray-600 text-xs px-2 py-1">
                              +{consent.dataTypes.length - 3} mais
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="ml-4">
                    <CollapsibleTrigger asChild>
                      <Button 
                        size="sm" 
                        className="bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 shadow-sm"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {isExpanded ? "Ocultar" : "Detalhes"}
                        {isExpanded ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>

                {/* Expanded Content */}
                <CollapsibleContent className="space-y-6">
                  <div className="border-t border-white/30 pt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Legal Basis */}
                      <Card className="bg-white/60 border-0 shadow-sm">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-sm text-gray-800">
                            <Shield className="h-4 w-4 text-blue-600" />
                            Base Legal (LGPD)
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-gray-700">{consent.legalBasis}</p>
                        </CardContent>
                      </Card>

                      {/* Controller */}
                      <Card className="bg-white/60 border-0 shadow-sm">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-sm text-gray-800">
                            <Building className="h-4 w-4 text-purple-600" />
                            Controlador de Dados
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-gray-700">{consent.controller}</p>
                        </CardContent>
                      </Card>

                      {/* Creation Date */}
                      <Card className="bg-white/60 border-0 shadow-sm">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-sm text-gray-800">
                            <Calendar className="h-4 w-4 text-green-600" />
                            Data da Solicitação
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-gray-700">
                            {consent.createdAt.toLocaleDateString("pt-BR")} às {consent.createdAt.toLocaleTimeString("pt-BR")}
                          </p>
                        </CardContent>
                      </Card>

                      {/* Processing Status */}
                      <Card className="bg-white/60 border-0 shadow-sm">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-sm text-gray-800">
                            <Activity className="h-4 w-4 text-orange-600" />
                            Status do Processamento
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-gray-700">
                            {consent.status === "approved"
                              ? "Aprovado e token JWT emitido"
                              : consent.status === "rejected"
                              ? "Negado pelo titular"
                              : "Aguardando aprovação do titular"}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* All Data Types */}
                    <Card className="mt-6 bg-white/60 border-0 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm text-gray-800">
                          <Database className="h-4 w-4 text-indigo-600" />
                          Todos os Tipos de Dados Solicitados
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-2">
                          {consent.dataTypes.map((type) => (
                            <Badge key={type} className="bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs px-3 py-1">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* JWT Token Section */}
                    {consent.status === "approved" && consent.scopes && consent.tokenId && (
                      <Card className="mt-6 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Award className="h-5 w-5" />
                            Artefato de Consentimento (JSON Web Token)
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                          {/* Token */}
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Key className="h-4 w-4 text-green-600" />
                              <p className="text-sm font-semibold text-green-800">Token JWT com Assinatura Digital</p>
                            </div>
                            <div className="bg-white/80 rounded-lg p-4 border border-green-200">
                              <code className="block text-xs font-mono text-gray-700 break-all leading-relaxed">
                                {consent.tokenId}
                              </code>
                            </div>
                          </div>

                          {/* Scopes */}
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Lock className="h-4 w-4 text-green-600" />
                              <p className="text-sm font-semibold text-green-800">Escopos de Acesso Autorizados (Senatran API)</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {consent.scopes.map((scope) => (
                                <Badge key={scope} className="bg-green-200 text-green-800 border border-green-300 text-xs font-mono px-3 py-1">
                                  <Zap className="h-3 w-3 mr-1" />
                                  {scope}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Warning */}
                          <div className="bg-gradient-to-r from-amber-50 to-amber-100 border-2 border-amber-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm text-amber-800 font-medium mb-1">Informações Importantes</p>
                                <p className="text-xs text-amber-700 leading-relaxed">
                                  Este token permite acesso limitado aos dados do titular conforme os escopos
                                  autorizados. O token possui validade até <strong>{new Date(consent.deadline).toLocaleDateString("pt-BR")}</strong> e pode
                                  ser revogado pelo titular a qualquer momento.
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </CollapsibleContent>
              </CardContent>
            </Collapsible>
          </Card>
        );
      })}

      {/* Empty State */}
      {consents.length === 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100">
          <CardContent className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full mb-6">
              <FileCheck className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Nenhuma solicitação encontrada</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Crie uma nova solicitação de consentimento para acessar dados da Senatran e começar a gerenciar seus tokens de acesso
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConsentList;
