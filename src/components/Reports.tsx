import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Activity,
  Target,
  Database,
  PieChart,
  Award,
  TrendingDown
} from 'lucide-react';

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
}

interface ConsentAction {
  id: string;
  action: 'created' | 'approved' | 'rejected' | 'revoked';
  timestamp: Date;
  performedBy: 'user' | 'system';
  reason?: string;
}

interface ReportsProps {
  consents: ConsentRequest[];
}

const Reports: React.FC<ReportsProps> = ({ consents }) => {
  // Cálculos de estatísticas
  const totalConsents = consents.length;
  const approvedConsents = consents.filter(c => c.status === 'approved').length;
  const pendingConsents = consents.filter(c => c.status === 'pending').length;
  const rejectedConsents = consents.filter(c => c.status === 'rejected' || c.revokedAt).length;
  
  const approvalRate = totalConsents > 0 ? ((approvedConsents / totalConsents) * 100).toFixed(1) : '0';
  const rejectionRate = totalConsents > 0 ? ((rejectedConsents / totalConsents) * 100).toFixed(1) : '0';

  // Estatísticas por tipo de usuário
  const userTypeStats = consents.reduce((acc, consent) => {
    const type = consent.dataUserType;
    if (!acc[type]) {
      acc[type] = { total: 0, approved: 0, pending: 0, rejected: 0 };
    }
    acc[type].total++;
    if (consent.status === 'approved') acc[type].approved++;
    else if (consent.status === 'pending') acc[type].pending++;
    else acc[type].rejected++;
    return acc;
  }, {} as Record<string, { total: number; approved: number; pending: number; rejected: number }>);

  // Estatísticas por mês
  const monthlyStats = consents.reduce((acc, consent) => {
    const month = consent.createdAt.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' });
    if (!acc[month]) {
      acc[month] = { total: 0, approved: 0, pending: 0, rejected: 0 };
    }
    acc[month].total++;
    if (consent.status === 'approved') acc[month].approved++;
    else if (consent.status === 'pending') acc[month].pending++;
    else acc[month].rejected++;
    return acc;
  }, {} as Record<string, { total: number; approved: number; pending: number; rejected: number }>);

  // Tipos de dados mais solicitados
  const dataTypeStats = consents.reduce((acc, consent) => {
    consent.dataTypes.forEach(type => {
      if (!acc[type]) acc[type] = 0;
      acc[type]++;
    });
    return acc;
  }, {} as Record<string, number>);

  const topDataTypes = Object.entries(dataTypeStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-600 rounded-full mb-4">
          <BarChart3 className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-4xl font-bold text-gray-900 mb-2">
          Relatórios e Análises
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Análise detalhada dos consentimentos e estatísticas do sistema para tomada de decisões estratégicas
        </p>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="overflow-hidden border border-gray-200 shadow-lg bg-gray-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Total de Consentimentos</p>
                <p className="text-3xl font-bold text-gray-900">{totalConsents}</p>
                <p className="text-xs text-gray-600 mt-1">
                  Todos os registros
                </p>
              </div>
              <div className="p-3 bg-gray-200 rounded-full">
                <FileText className="h-6 w-6 text-gray-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border border-gray-200 shadow-lg bg-gray-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Taxa de Aprovação</p>
                <p className="text-3xl font-bold text-green-700">{approvalRate}%</p>
                <p className="text-xs text-gray-600 mt-1">
                  {approvedConsents} de {totalConsents} aprovados
                </p>
              </div>
              <div className="p-3 bg-gray-200 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border border-gray-200 shadow-lg bg-gray-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Pendentes</p>
                <p className="text-3xl font-bold text-amber-700">{pendingConsents}</p>
                <p className="text-xs text-gray-600 mt-1">
                  Aguardando análise
                </p>
              </div>
              <div className="p-3 bg-gray-200 rounded-full">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border border-gray-200 shadow-lg bg-gray-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Taxa de Rejeição</p>
                <p className="text-3xl font-bold text-red-700">{rejectionRate}%</p>
                <p className="text-xs text-gray-600 mt-1">
                  {rejectedConsents} rejeitados/revogados
                </p>
              </div>
              <div className="p-3 bg-gray-200 rounded-full">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas por Tipo de Usuário */}
      <Card className="overflow-hidden shadow-lg border border-gray-200">
        <CardHeader className="bg-gray-600 text-white">
          <CardTitle className="flex items-center text-xl">
            <Users className="h-6 w-6 mr-3" />
            Consentimentos por Tipo de Usuário
          </CardTitle>
          <CardDescription className="text-gray-100">
            Distribuição de consentimentos por categoria de usuário
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {Object.entries(userTypeStats).length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum dado disponível</p>
              </div>
            ) : (
              Object.entries(userTypeStats).map(([type, stats]) => (
                <div key={type} className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {type.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{type}</h4>
                        <p className="text-sm text-gray-600">Total: {stats.total} consentimentos</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {stats.approved}
                      </Badge>
                      <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-3 py-1 rounded-full">
                        <Clock className="h-3 w-3 mr-1" />
                        {stats.pending}
                      </Badge>
                      <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full">
                        <XCircle className="h-3 w-3 mr-1" />
                        {stats.rejected}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tipos de Dados Mais Solicitados */}
      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
          <CardTitle className="flex items-center text-xl">
            <Database className="h-6 w-6 mr-3" />
            Tipos de Dados Mais Solicitados
          </CardTitle>
          <CardDescription className="text-indigo-100">
            Ranking dos tipos de dados mais requisitados
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {topDataTypes.length === 0 ? (
              <div className="text-center py-8">
                <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum dado disponível</p>
              </div>
            ) : (
              topDataTypes.map(([type, count], index) => (
                <div key={type} className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                      index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                      index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                      'bg-gradient-to-r from-indigo-400 to-indigo-500'
                    }`}>
                      {index === 0 ? <Award className="h-4 w-4" /> : index + 1}
                    </div>
                    <span className="font-semibold text-gray-900">{type}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-3 rounded-full transition-all duration-500" 
                        style={{ width: `${(count / Math.max(...Object.values(dataTypeStats))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-lg font-bold text-indigo-600 w-8 text-right">{count}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Mensais */}
      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
          <CardTitle className="flex items-center text-xl">
            <Calendar className="h-6 w-6 mr-3" />
            Consentimentos por Mês
          </CardTitle>
          <CardDescription className="text-teal-100">
            Evolução temporal dos consentimentos
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {Object.entries(monthlyStats).length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum dado disponível</p>
              </div>
            ) : (
              Object.entries(monthlyStats).map(([month, stats]) => (
                <div key={month} className="p-4 bg-gradient-to-r from-teal-50 to-teal-100 rounded-xl border border-teal-200 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{month}</h4>
                        <p className="text-sm text-gray-600">Total: {stats.total} consentimentos</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full">
                        Aprovados: {stats.approved}
                      </Badge>
                      <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-3 py-1 rounded-full">
                        Pendentes: {stats.pending}
                      </Badge>
                      <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full">
                        Rejeitados: {stats.rejected}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;