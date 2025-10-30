import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  AlertTriangle
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
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  revokedAt?: Date;
  lastModified: Date;
  actionHistory: ConsentAction[];
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
      <div>
        <h2 className="mb-2 text-3xl font-bold text-foreground">Relatórios</h2>
        <p className="text-muted-foreground">
          Análise detalhada dos consentimentos e estatísticas do sistema
        </p>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Consentimentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConsents}</div>
            <p className="text-xs text-muted-foreground">
              Todos os consentimentos registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Aprovação</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvalRate}%</div>
            <p className="text-xs text-muted-foreground">
              {approvedConsents} de {totalConsents} aprovados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingConsents}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando análise
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Rejeição</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {rejectedConsents} rejeitados/revogados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas por Tipo de Usuário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Consentimentos por Tipo de Usuário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(userTypeStats).map(([type, stats]) => (
              <div key={type} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">{type}</h4>
                  <p className="text-sm text-muted-foreground">Total: {stats.total} consentimentos</p>
                </div>
                <div className="flex space-x-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {stats.approved}
                  </Badge>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    <Clock className="h-3 w-3 mr-1" />
                    {stats.pending}
                  </Badge>
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    <XCircle className="h-3 w-3 mr-1" />
                    {stats.rejected}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tipos de Dados Mais Solicitados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Tipos de Dados Mais Solicitados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topDataTypes.map(([type, count], index) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <span className="font-medium">{type}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(count / Math.max(...Object.values(dataTypeStats))) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Mensais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Consentimentos por Mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(monthlyStats).map(([month, stats]) => (
              <div key={month} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">{month}</h4>
                  <p className="text-sm text-muted-foreground">Total: {stats.total} consentimentos</p>
                </div>
                <div className="flex space-x-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Aprovados: {stats.approved}
                  </Badge>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    Pendentes: {stats.pending}
                  </Badge>
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    Rejeitados: {stats.rejected}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;