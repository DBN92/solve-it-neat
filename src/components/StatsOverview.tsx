import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileCheck,
  TrendingUp,
  Activity,
  BarChart3,
  Target,
  Award,
  AlertTriangle
} from 'lucide-react';

interface ConsentAction {
  id: string;
  action: 'created' | 'approved' | 'rejected' | 'revoked';
  timestamp: Date;
  reason?: string;
  performedBy: 'user' | 'system';
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

interface StatsOverviewProps {
  consents: ConsentRequest[];
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ consents }) => {
  const totalConsents = consents.length;
  const approvedConsents = consents.filter(c => c.status === 'approved').length;
  const pendingConsents = consents.filter(c => c.status === 'pending').length;
  const rejectedConsents = consents.filter(c => c.status === 'rejected' || c.revokedAt).length;

  const approvalRate = totalConsents > 0 ? (approvedConsents / totalConsents) * 100 : 0;
  const pendingRate = totalConsents > 0 ? (pendingConsents / totalConsents) * 100 : 0;
  const rejectionRate = totalConsents > 0 ? (rejectedConsents / totalConsents) * 100 : 0;

  const stats = [
    {
      title: 'Total de Consentimentos',
      value: totalConsents,
      icon: FileCheck,
      textColor: 'text-gray-700',
      iconBg: 'bg-gray-200',
      iconColor: 'text-gray-700',
      description: 'Todos os registros',
      progress: 100,
      trend: totalConsents > 0 ? 'up' : 'neutral'
    },
    {
      title: 'Aprovados',
      value: approvedConsents,
      icon: CheckCircle2,
      textColor: 'text-green-700',
      iconBg: 'bg-gray-200',
      iconColor: 'text-green-600',
      description: `${approvalRate.toFixed(1)}% do total`,
      progress: approvalRate,
      trend: approvalRate > 70 ? 'up' : approvalRate > 40 ? 'neutral' : 'down'
    },
    {
      title: 'Pendentes',
      value: pendingConsents,
      icon: Clock,
      textColor: 'text-amber-700',
      iconBg: 'bg-gray-200',
      iconColor: 'text-amber-600',
      description: `${pendingRate.toFixed(1)}% aguardando`,
      progress: pendingRate,
      trend: pendingRate < 30 ? 'up' : pendingRate < 60 ? 'neutral' : 'down'
    },
    {
      title: 'Rejeitados',
      value: rejectedConsents,
      icon: XCircle,
      textColor: 'text-red-700',
      iconBg: 'bg-gray-200',
      iconColor: 'text-red-600',
      description: `${rejectionRate.toFixed(1)}% rejeitados`,
      progress: rejectionRate,
      trend: rejectionRate < 20 ? 'up' : rejectionRate < 40 ? 'neutral' : 'down'
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-600 rounded-full mb-4">
          <BarChart3 className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Visão Geral das Estatísticas
        </h2>
        <p className="text-gray-600 max-w-xl mx-auto">
          Acompanhe o desempenho e status dos consentimentos em tempo real
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={stat.title} 
              className={`overflow-hidden border border-gray-200 shadow-lg bg-gray-50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${stat.textColor} mb-1`}>
                      {stat.title}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className={`text-3xl font-bold ${stat.textColor.replace('700', '900')}`}>
                        {stat.value}
                      </p>
                      <div className={`flex items-center ${getTrendColor(stat.trend)}`}>
                        {getTrendIcon(stat.trend)}
                      </div>
                    </div>
                    <p className={`text-xs ${stat.textColor.replace('700', '600')} mt-1`}>
                      {stat.description}
                    </p>
                  </div>
                  <div className={`p-3 ${stat.iconBg} rounded-full`}>
                    <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className={stat.textColor}>Progresso</span>
                    <span className={`font-semibold ${stat.textColor}`}>
                      {stat.progress.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`bg-gray-600 h-2 rounded-full transition-all duration-1000 ease-out`}
                      style={{ 
                        width: `${Math.min(stat.progress, 100)}%`,
                        animationDelay: `${index * 200 + 500}ms`
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Card */}
      {totalConsents > 0 && (
        <Card className="mt-8 overflow-hidden shadow-lg border-0 bg-gradient-to-br from-gray-50 to-gray-100">
          <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
            <CardTitle className="flex items-center text-xl">
              <Target className="h-6 w-6 mr-3" />
              Resumo Executivo
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-3">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Taxa de Eficiência</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {((approvedConsents + rejectedConsents) / totalConsents * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600">Consentimentos processados</p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-3">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Taxa de Sucesso</h3>
                <p className="text-2xl font-bold text-green-600">
                  {totalConsents > 0 ? ((approvedConsents / (approvedConsents + rejectedConsents || 1)) * 100).toFixed(1) : '0'}%
                </p>
                <p className="text-sm text-gray-600">Aprovações vs. total processado</p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full mb-3">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Pendências</h3>
                <p className="text-2xl font-bold text-yellow-600">{pendingConsents}</p>
                <p className="text-sm text-gray-600">Aguardando processamento</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StatsOverview;
