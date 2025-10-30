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
  status: "pending" | "approved" | "rejected";
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

const Index = () => {
  const { user, logout } = useAuth();
  const { hasPermission, getAvailableTabs } = usePermissions();
  
  type TabType = "dashboard" | "new-request" | "consents" | "data-owner" | "reports" | "applicant" | "users" | "supabase-test";
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [consents, setConsents] = useState<ConsentRequest[]>([]);
  const [isLoadingConsents, setIsLoadingConsents] = useState(true);

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
      setActiveTab("consents");
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Logo size="md" showText={true} />
            <div className="flex items-center gap-4">
              <nav className="flex gap-2">
                {hasPermission("dashboard") && (
                  <Button
                    variant={activeTab === "dashboard" ? "default" : "ghost"}
                    onClick={() => setActiveTab("dashboard")}
                  >
                    Dashboard
                  </Button>
                )}
                {hasPermission("new-request") && (
                  <Button
                    variant={activeTab === "new-request" ? "default" : "ghost"}
                    onClick={() => setActiveTab("new-request")}
                  >
                    Nova Manifestação
                  </Button>
                )}
                {hasPermission("applicant") && (
                  <Button
                    variant={activeTab === "applicant" ? "default" : "ghost"}
                    onClick={() => setActiveTab("applicant")}
                  >
                    Solicitante
                  </Button>
                )}
                {hasPermission("consents") && (
                  <Button
                    variant={activeTab === "consents" ? "default" : "ghost"}
                    onClick={() => setActiveTab("consents")}
                  >
                    Consentimentos
                  </Button>
                )}
                {hasPermission("data-owner") && (
                  <Button
                    variant={activeTab === "data-owner" ? "default" : "ghost"}
                    onClick={() => setActiveTab("data-owner")}
                  >
                    Meus Dados
                  </Button>
                )}
                {hasPermission("reports") && (
                  <Button
                    variant={activeTab === "reports" ? "default" : "ghost"}
                    onClick={() => setActiveTab("reports")}
                  >
                    Relatórios
                  </Button>
                )}
                {hasPermission("users") && (
                  <Button
                    variant={activeTab === "users" ? "default" : "ghost"}
                    onClick={() => setActiveTab("users")}
                  >
                    Usuários
                  </Button>
                )}
                <Button
                  variant={activeTab === "supabase-test" ? "default" : "ghost"}
                  onClick={() => setActiveTab("supabase-test")}
                >
                  Teste Supabase
                </Button>
              </nav>
              
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {user?.name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={logout} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === "dashboard" && (
          <div className="animate-fade-in space-y-8">
            <div>
              <h2 className="mb-2 text-3xl font-bold text-foreground">Dashboard</h2>
              <p className="text-muted-foreground">
                Visão geral das solicitações de acesso a dados da Senatran e tokens JWT emitidos
              </p>
            </div>

            <StatsOverview consents={consents} />

            {/* Recent Activity */}
            <div>
              <h3 className="mb-4 text-xl font-semibold text-foreground">Atividade Recente</h3>
              <div className="space-y-3">
                {consents.slice(0, 5).map((consent) => (
                  <Card key={consent.id} className="p-4 transition-shadow hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`rounded-full p-2 ${
                            consent.status === "approved"
                              ? "bg-success/10"
                              : consent.status === "rejected"
                              ? "bg-destructive/10"
                              : "bg-warning/10"
                          }`}
                        >
                          {consent.status === "approved" ? (
                            <CheckCircle2 className="h-5 w-5 text-success" />
                          ) : consent.status === "rejected" ? (
                            <XCircle className="h-5 w-5 text-destructive" />
                          ) : (
                            <Clock className="h-5 w-5 text-warning" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">{consent.id}</span>
                            <Badge
                              variant={
                                consent.status === "approved"
                                  ? "default"
                                  : consent.status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {consent.status === "approved"
                                ? "Aprovado"
                                : consent.status === "rejected"
                                ? "Negado"
                                : "Pendente"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{consent.purpose}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3">
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">{consent.dataUser}</p>
                          <p className="text-xs text-muted-foreground">{consent.dataUserType}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {consent.createdAt.toLocaleDateString("pt-BR")}
                          </p>
                          <div className="flex gap-1 mt-1 justify-end flex-wrap">
                            {consent.dataTypes.slice(0, 2).map((type) => (
                              <Badge key={type} variant="outline" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                            {consent.dataTypes.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{consent.dataTypes.length - 2}
                              </Badge>
                            )}
                          </div>
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
          <div className="animate-fade-in">
            <div className="mb-8">
              <h2 className="mb-2 text-3xl font-bold text-foreground">Nova Solicitação de Consentimento</h2>
              <p className="text-muted-foreground">
                Preencha os dados para solicitar acesso aos dados do titular via Senatran
              </p>
            </div>
            <ConsentRequestForm onSubmit={handleNewConsent} applicants={applicants} />
          </div>
        )}

        {activeTab === "consents" && (
          <div className="animate-fade-in">
            <div className="mb-8">
              <h2 className="mb-2 text-3xl font-bold text-foreground">Registro de Consentimentos</h2>
              <p className="text-muted-foreground">
                Visualize e gerencie todas as solicitações de acesso aos dados da Senatran
              </p>
            </div>
            <ConsentList consents={consents} />
          </div>
        )}

        {activeTab === "data-owner" && (
          <div className="animate-fade-in">
            <div className="mb-8">
              <h2 className="mb-2 text-3xl font-bold text-foreground">Meus Dados</h2>
              <p className="text-muted-foreground">
                Gerencie o acesso aos seus dados pessoais - aprove ou revogue consentimentos
              </p>
            </div>
            <DataOwnerConsents 
              consents={consents} 
              onApprove={handleApprove}
              onRevoke={handleRevoke}
            />
          </div>
        )}

        {activeTab === "reports" && (
          <div className="animate-fade-in">
            <Reports consents={consents} />
          </div>
        )}

        {activeTab === "applicant" && (
          <div className="animate-fade-in">
            <ApplicantManagement 
              applicants={applicants}
              onNewApplicant={handleNewApplicant}
              onUpdateApplicant={handleUpdateApplicant}
              onToggleStatus={handleToggleApplicantStatus}
            />
          </div>
        )}

        {activeTab === "users" && (
          <div className="animate-fade-in">
            <UserManagement />
          </div>
        )}

        {activeTab === "supabase-test" && (
          <div className="animate-fade-in">
            <div className="mb-8">
              <h2 className="mb-2 text-3xl font-bold text-foreground">Teste Supabase</h2>
              <p className="text-muted-foreground">
                Teste a conexão e funcionalidades do Supabase
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
