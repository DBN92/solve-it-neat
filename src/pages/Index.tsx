import React, { useState } from "react";
import { Shield, CheckCircle2, XCircle, Clock, FileCheck, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ConsentRequestForm from "@/components/ConsentRequestForm";
import ConsentList from "@/components/ConsentList";
import StatsOverview from "@/components/StatsOverview";

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
}

const Index = () => {
  const [activeTab, setActiveTab] = useState<"dashboard" | "new-request" | "consents">("dashboard");
  const [consents, setConsents] = useState<ConsentRequest[]>([
    {
      id: "GCC-2024-001",
      dataUser: "Porto Seguro Auto",
      dataUserType: "Seguradora",
      dataOwner: "João da Silva Santos",
      cpf: "123.456.789-00",
      dataTypes: ["CNH", "Pontuação", "Multas"],
      purpose: "Cálculo de prêmio de seguro auto baseado no histórico de condução",
      legalBasis: "Consentimento explícito do titular",
      deadline: "2025-12-31",
      controller: "Porto Seguro Companhia de Seguros Gerais",
      status: "approved",
      createdAt: new Date("2024-10-15"),
      scopes: ["senatran:cnh:read", "senatran:pontuacao:read", "senatran:multas:read"],
      tokenId: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwMCIsInNjb3BlcyI6WyJzZW5hdHJhbjpjbmg6cmVhZCIsInNlbmF0cmFuOnBvbnR1YWNhbzpyZWFkIiwic2VuYXRyYW46bXVsdGFzOnJlYWQiXX0",
    },
    {
      id: "GCC-2024-002",
      dataUser: "99 Mobilidade Urbana",
      dataUserType: "App de Mobilidade",
      dataOwner: "Maria Oliveira Costa",
      cpf: "987.654.321-00",
      dataTypes: ["CNH", "Veículos"],
      purpose: "Validação de habilitação para cadastro de motorista parceiro",
      legalBasis: "Execução de contrato",
      deadline: "2025-06-30",
      controller: "99 Tecnologia e Mobilidade Ltda",
      status: "pending",
      createdAt: new Date("2024-10-28"),
    },
  ]);

  const handleNewConsent = (consent: Omit<ConsentRequest, "id" | "status" | "createdAt">) => {
    const newConsent: ConsentRequest = {
      ...consent,
      id: `CNS-${String(consents.length + 1).padStart(3, "0")}`,
      status: "pending",
      createdAt: new Date(),
    };
    setConsents([newConsent, ...consents]);
    setActiveTab("consents");
  };

  const handleApprove = (id: string) => {
    setConsents(
      consents.map((c) => {
        if (c.id === id) {
          // Gerar escopos baseados nos tipos de dados solicitados
          const scopes = c.dataTypes.map(type => {
            const scopeMap: Record<string, string> = {
              "CNH": "senatran:cnh:read",
              "Veículos": "senatran:veiculos:read",
              "Multas": "senatran:multas:read",
              "Pontuação": "senatran:pontuacao:read",
            };
            return scopeMap[type] || `senatran:${type.toLowerCase()}:read`;
          });
          
          return {
            ...c,
            status: "approved",
            scopes,
            tokenId: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ sub: c.cpf, scopes }))}`,
          };
        }
        return c;
      })
    );
  };

  const handleReject = (id: string) => {
    setConsents(consents.map((c) => (c.id === id ? { ...c, status: "rejected" } : c)));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-primary to-secondary p-2">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
              <h1 className="text-2xl font-bold text-foreground">GCC Senatran</h1>
                <p className="text-sm text-muted-foreground">Gateway de Consentimento e Compartilhamento</p>
              </div>
            </div>
            <nav className="flex gap-2">
              <Button
                variant={activeTab === "dashboard" ? "default" : "ghost"}
                onClick={() => setActiveTab("dashboard")}
              >
                Dashboard
              </Button>
              <Button
                variant={activeTab === "new-request" ? "default" : "ghost"}
                onClick={() => setActiveTab("new-request")}
              >
                Nova Manifestação
              </Button>
              <Button
                variant={activeTab === "consents" ? "default" : "ghost"}
                onClick={() => setActiveTab("consents")}
              >
                Consentimentos
              </Button>
            </nav>
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
            <ConsentRequestForm onSubmit={handleNewConsent} />
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
            <ConsentList consents={consents} onApprove={handleApprove} onReject={handleReject} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
