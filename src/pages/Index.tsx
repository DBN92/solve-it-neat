import { useState } from "react";
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
  dataOwner: string;
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
      id: "CNS-001",
      dataUser: "Sistema de Marketing",
      dataOwner: "João Silva",
      purpose: "Envio de newsletters e comunicações promocionais",
      legalBasis: "Consentimento explícito",
      deadline: "2025-12-31",
      controller: "Marketing Ltda",
      status: "approved",
      createdAt: new Date("2024-10-15"),
      scopes: ["email:read", "profile:basic"],
      tokenId: "jwt_abc123",
    },
    {
      id: "CNS-002",
      dataUser: "Sistema de Analytics",
      dataOwner: "Maria Santos",
      purpose: "Análise de comportamento de navegação",
      legalBasis: "Interesse legítimo",
      deadline: "2025-06-30",
      controller: "Analytics Corp",
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
      consents.map((c) =>
        c.id === id
          ? {
              ...c,
              status: "approved",
              scopes: ["data:read", "data:write"],
              tokenId: `jwt_${Math.random().toString(36).substring(7)}`,
            }
          : c
      )
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
                <h1 className="text-2xl font-bold text-foreground">GCC</h1>
                <p className="text-sm text-muted-foreground">Sistema de Gestão de Consentimento</p>
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
                Visão geral das manifestações de consentimento e tokens gerados
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
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">{consent.dataUser}</p>
                        <p className="text-xs text-muted-foreground">
                          {consent.createdAt.toLocaleDateString("pt-BR")}
                        </p>
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
              <h2 className="mb-2 text-3xl font-bold text-foreground">Nova Manifestação de Consentimento</h2>
              <p className="text-muted-foreground">
                Preencha os dados para solicitar uma nova manifestação de consentimento
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
                Visualize e gerencie todas as manifestações de consentimento
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
