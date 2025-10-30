import React, { useState, useEffect } from "react";
import { Shield, CheckCircle2, XCircle, Clock, FileCheck, Key, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ConsentRequestForm from "@/components/ConsentRequestForm";
import ConsentList from "@/components/ConsentList";
import StatsOverview from "@/components/StatsOverview";
import DataOwnerConsents from "@/components/DataOwnerConsents";
import Reports from "@/components/Reports";
import ApplicantManagement from "@/components/ApplicantManagement";
import { UserManagement } from "@/components/UserManagement";
import SupabaseTest from "@/components/SupabaseTest";
import Logo from "@/components/Logo";
import { useAuth, usePermissions } from "@/contexts/AuthContext";
import { db } from "@/services/database";

export interface ConsentRequest {
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
  status: "pending" | "approved" | "rejected" | "revoked";
  createdAt: Date;
  scopes?: string[];
  tokenId?: string;
  revokedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  lastModified: Date;
  actionHistory: ConsentAction[];
}

export interface ConsentAction {
  id: string;
  action: "created" | "approved" | "rejected" | "revoked";
  timestamp: Date;
  reason?: string;
  performedBy: "user" | "system";
}

export interface Applicant {
  id: string;
  name: string;
  type: string;
  cnpj?: string;
  cpf?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  responsiblePerson?: string;
  createdAt: Date;
  isActive: boolean;
}

interface IndexProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const Index: React.FC<IndexProps> = ({ activeTab: propActiveTab, onTabChange }) => {
  const { user, logout } = useAuth();
  const { hasPermission, getAvailableTabs } = usePermissions();
  
  type TabType = "dashboard" | "new-request" | "consents" | "data-owner" | "reports" | "applicant" | "users" | "supabase-test";
  const [activeTab, setActiveTab] = useState<TabType>(propActiveTab as TabType || "dashboard");
  const [consents, setConsents] = useState<ConsentRequest[]>([]);
  const [isLoadingConsents, setIsLoadingConsents] = useState(true);

  // Sincronizar activeTab com prop
  useEffect(() => {
    if (propActiveTab) {
      setActiveTab(propActiveTab as TabType);
    }
  }, [propActiveTab]);

  // Notificar mudanças de tab para o parent
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  // Carregar consentimentos da base de dados
  useEffect(() => {
    const loadConsents = async () => {
      try {
        setIsLoadingConsents(true);
        const consentData = await db.consents.getConsents();
        setConsents(consentData);
      } catch (error) {
        console.error("Erro ao carregar consentimentos:", error);
      } finally {
        setIsLoadingConsents(false);
      }
    };

    loadConsents();
  }, []);



  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [isLoadingApplicants, setIsLoadingApplicants] = useState(true);

  // Carregar aplicantes da base de dados
  useEffect(() => {
    const loadApplicants = async () => {
      try {
        setIsLoadingApplicants(true);
        const applicantData = await db.applicants.getApplicants();
        setApplicants(applicantData);
      } catch (error) {
        console.error("Erro ao carregar aplicantes:", error);
      } finally {
        setIsLoadingApplicants(false);
      }
    };

    loadApplicants();
  }, []);

  const handleNewConsent = async (consent: Omit<ConsentRequest, "id" | "status" | "createdAt">) => {
    try {
      const newConsent: ConsentRequest = {
        ...consent,
        id: `CNS-${String(consents.length + 1).padStart(3, "0")}`,
        status: "pending",
        createdAt: new Date(),
        lastModified: new Date(),
        actionHistory: [{
          id: `action-${Date.now()}`,
          action: "created",
          timestamp: new Date(),
          performedBy: "system"
        }]
      };
      
      await db.consents.createConsent(newConsent);
      setConsents([newConsent, ...consents]);
      handleTabChange("consents");
    } catch (error) {
      console.error("Erro ao criar consentimento:", error);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const consent = consents.find(c => c.id === id);
      if (!consent) return;

      // Gerar escopos baseados nos tipos de dados solicitados
      const scopes = consent.dataTypes.map(type => {
        const scopeMap: Record<string, string> = {
          "CNH": "senatran:cnh:read",
          "Veículos": "senatran:veiculos:read",
          "Multas": "senatran:multas:read",
          "Pontuação": "senatran:pontuacao:read",
        };
        return scopeMap[type] || `senatran:${type.toLowerCase()}:read`;
      });
      
      const now = new Date();
      const newAction: ConsentAction = {
        id: `action-${Date.now()}`,
        action: "approved",
        timestamp: now,
        performedBy: "user",
        reason: "Consentimento aprovado pelo titular dos dados"
      };
      
      const updatedConsent = {
        ...consent,
        status: "approved" as const,
        scopes,
        tokenId: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ sub: consent.cpf, scopes }))}`,
        approvedAt: now,
        lastModified: now,
        actionHistory: [...consent.actionHistory, newAction]
      };

      await db.consents.updateConsent(id, updatedConsent);
      setConsents(consents.map(c => c.id === id ? updatedConsent : c));
    } catch (error) {
      console.error("Erro ao aprovar consentimento:", error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const consent = consents.find(c => c.id === id);
      if (!consent) return;

      const now = new Date();
      const newAction: ConsentAction = {
        id: `action-${Date.now()}`,
        action: "rejected",
        timestamp: now,
        performedBy: "user",
        reason: "Consentimento rejeitado pelo titular dos dados"
      };

      const updatedConsent = {
        ...consent,
        status: "rejected" as const,
        rejectedAt: now,
        lastModified: now,
        actionHistory: [...consent.actionHistory, newAction]
      };

      await db.consents.updateConsent(id, updatedConsent);
      setConsents(consents.map(c => c.id === id ? updatedConsent : c));
    } catch (error) {
      console.error("Erro ao rejeitar consentimento:", error);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      const consent = consents.find(c => c.id === id);
      if (!consent) return;

      const now = new Date();
      const newAction: ConsentAction = {
        id: `action-${Date.now()}`,
        action: "revoked",
        timestamp: now,
        performedBy: "user",
        reason: "Consentimento revogado pelo titular dos dados"
      };
      
      const updatedConsent = {
        ...consent,
        // Mantém o status como approved, mas marca como revogado
        revokedAt: now,
        lastModified: now,
        scopes: undefined,
        tokenId: undefined,
        actionHistory: [...consent.actionHistory, newAction]
      };

      await db.consents.updateConsent(id, updatedConsent);
      setConsents(consents.map(c => c.id === id ? updatedConsent : c));
    } catch (error) {
      console.error("Erro ao revogar consentimento:", error);
    }
  };

  const handleNewApplicant = async (applicant: Omit<Applicant, "id" | "createdAt">) => {
    try {
      const newApplicant: Applicant = {
        ...applicant,
        id: `APP-${String(applicants.length + 1).padStart(3, "0")}`,
        createdAt: new Date(),
      };
      
      await db.applicants.createApplicant(newApplicant);
      setApplicants([newApplicant, ...applicants]);
    } catch (error) {
      console.error("Erro ao criar aplicante:", error);
    }
  };

  const handleUpdateApplicant = async (id: string, updatedApplicant: Partial<Applicant>) => {
    try {
      await db.applicants.updateApplicant(id, updatedApplicant);
      setApplicants(applicants.map((a) => (a.id === id ? { ...a, ...updatedApplicant } : a)));
    } catch (error) {
      console.error("Erro ao atualizar aplicante:", error);
    }
  };

  const handleToggleApplicantStatus = async (id: string) => {
    try {
      const applicant = applicants.find(a => a.id === id);
      if (!applicant) return;

      const updatedApplicant = { ...applicant, isActive: !applicant.isActive };
      await db.applicants.updateApplicant(id, { isActive: !applicant.isActive });
      setApplicants(applicants.map((a) => (a.id === id ? updatedApplicant : a)));
    } catch (error) {
      console.error("Erro ao alterar status do aplicante:", error);
    }
  };

  return (
    <div className="p-6">
      {/* Main Content */}
      <main className="container mx-auto">
        {activeTab === "dashboard" && (
          <div className="animate-fade-in space-y-8">
            {/* Header Section */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-50 rounded-full border border-blue-100">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-700">Sistema Ativo</span>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Visão geral das solicitações de acesso a dados da Senatran e tokens JWT emitidos
              </p>
            </div>

            <StatsOverview consents={consents} />

            {/* Recent Activity */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Atividade Recente</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleTabChange("consents")}
                  className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all duration-200"
                >
                  Ver Todos
                </Button>
              </div>
              
              <div className="grid gap-4">
                {consents.slice(0, 5).map((consent) => (
                  <Card key={consent.id} className="group p-6 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10 border-gray-100 hover:border-blue-200 bg-white/70 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`rounded-xl p-3 transition-all duration-200 ${
                            consent.status === "approved"
                              ? "bg-emerald-50 group-hover:bg-emerald-100"
                              : consent.status === "rejected"
                              ? "bg-red-50 group-hover:bg-red-100"
                              : "bg-amber-50 group-hover:bg-amber-100"
                          }`}
                        >
                          {consent.status === "approved" ? (

                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                          ) : consent.status === "rejected" ? (
                            <XCircle className="h-5 w-5 text-red-600" />
                          ) : (
                            <Clock className="h-5 w-5 text-amber-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-gray-900">{consent.id}</span>
                            <Badge
                              variant="outline"
                              className={`text-xs font-medium ${
                                consent.status === "approved"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : consent.status === "rejected"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}
                            >
                              {consent.status === "approved"
                                ? "Aprovado"
                                : consent.status === "rejected"
                                ? "Negado"
                                : "Pendente"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{consent.purpose}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{consent.dataUser}</span>
                            <span>•</span>
                            <span>{consent.createdAt.toLocaleDateString("pt-BR")}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{consent.dataUserType}</p>
                        </div>
                        <div className="flex gap-1 flex-wrap justify-end">
                          {consent.dataTypes.slice(0, 2).map((type) => (
                            <Badge key={type} variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              {type}
                            </Badge>
                          ))}
                          {consent.dataTypes.length > 2 && (
                            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                              +{consent.dataTypes.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "new-request" && (
          <div className="animate-fade-in space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-green-50 rounded-full border border-green-100">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-700">Nova Solicitação</span>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-green-800 to-emerald-800 bg-clip-text text-transparent">
                Nova Solicitação de Consentimento
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Crie uma nova solicitação de acesso aos dados da Senatran
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
              <ConsentRequestForm onSubmit={handleNewConsent} applicants={applicants} />
            </div>
          </div>
        )}

        {activeTab === "consents" && (
          <div className="animate-fade-in space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-purple-50 rounded-full border border-purple-100">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm font-medium text-purple-700">Gerenciamento</span>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-indigo-800 bg-clip-text text-transparent">
                Consentimentos
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Gerencie todas as solicitações de consentimento do sistema
              </p>
            </div>
            <ConsentList consents={consents} />
          </div>
        )}

        {activeTab === "data-owner" && (
          <div className="animate-fade-in space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-cyan-50 rounded-full border border-cyan-100">
                <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                <span className="text-sm font-medium text-cyan-700">Meus Dados</span>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-cyan-800 to-blue-800 bg-clip-text text-transparent">
                Meus Dados
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Visualize e gerencie seus consentimentos de dados
              </p>
            </div>
            <DataOwnerConsents consents={consents} onRevoke={handleRevoke} />
          </div>
        )}

        {activeTab === "reports" && (
          <div className="animate-fade-in space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-orange-50 rounded-full border border-orange-100">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm font-medium text-orange-700">Relatórios</span>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-orange-800 to-red-800 bg-clip-text text-transparent">
                Relatórios
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Análises detalhadas e estatísticas do sistema
              </p>
            </div>
            <Reports consents={consents} />
          </div>
        )}

        {activeTab === "applicant" && (
          <div className="animate-fade-in space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-teal-50 rounded-full border border-teal-100">
                <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                <span className="text-sm font-medium text-teal-700">Solicitantes</span>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-teal-800 to-green-800 bg-clip-text text-transparent">
                Gerenciar Solicitantes
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Cadastre e gerencie os solicitantes do sistema
              </p>
            </div>
            <ApplicantManagement
              applicants={applicants}
              onNewApplicant={handleNewApplicant}
              onUpdateApplicant={handleUpdateApplicant}
              onToggleStatus={handleToggleApplicantStatus}
            />
          </div>
        )}

        {activeTab === "users" && (
          <div className="animate-fade-in space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-rose-50 rounded-full border border-rose-100">
                <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                <span className="text-sm font-medium text-rose-700">Usuários</span>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-rose-800 to-pink-800 bg-clip-text text-transparent">
                Gerenciar Usuários
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Administre usuários e permissões do sistema
              </p>
            </div>
            <UserManagement />
          </div>
        )}

        {activeTab === "supabase-test" && (
          <div className="animate-fade-in space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Teste</span>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-slate-800 bg-clip-text text-transparent">
                Teste Supabase
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Teste de conectividade e funcionalidades do Supabase
              </p>
            </div>
            <SupabaseTest />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
