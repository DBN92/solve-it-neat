import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConsentRequest } from "@/pages/Index";
import { CheckCircle2, XCircle, Clock, Key, FileCheck, Calendar, User, Building } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

interface ConsentListProps {
  consents: ConsentRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const ConsentList = ({ consents, onApprove, onReject }: ConsentListProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {consents.map((consent) => (
        <Card key={consent.id} className="overflow-hidden transition-shadow hover:shadow-lg">
          <Collapsible open={expandedId === consent.id} onOpenChange={(open) => setExpandedId(open ? consent.id : null)}>
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`rounded-lg p-2 ${
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
                        <h3 className="text-lg font-semibold text-foreground">{consent.id}</h3>
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
                            : "Pendente Aprovação"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{consent.purpose}</p>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 mt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Usuário de Dado</p>
                        <p className="font-medium text-foreground">{consent.dataUser}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Titular</p>
                        <p className="font-medium text-foreground">{consent.dataOwner}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Prazo</p>
                        <p className="font-medium text-foreground">{new Date(consent.deadline).toLocaleDateString("pt-BR")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Controlador</p>
                        <p className="font-medium text-foreground">{consent.controller}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ml-4 flex flex-col gap-2">
                  {consent.status === "pending" && (
                    <>
                      <Button size="sm" onClick={() => onApprove(consent.id)} className="gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Aprovar
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => onReject(consent.id)} className="gap-2">
                        <XCircle className="h-4 w-4" />
                        Negar
                      </Button>
                    </>
                  )}
                  <CollapsibleTrigger asChild>
                    <Button size="sm" variant="outline">
                      {expandedId === consent.id ? "Ocultar" : "Detalhes"}
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </div>

              <CollapsibleContent className="mt-6 space-y-4 border-t border-border pt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <FileCheck className="h-4 w-4" />
                      Base Legal
                    </h4>
                    <p className="text-sm text-muted-foreground">{consent.legalBasis}</p>
                  </div>
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-foreground">Data de Criação</h4>
                    <p className="text-sm text-muted-foreground">
                      {consent.createdAt.toLocaleDateString("pt-BR")} às {consent.createdAt.toLocaleTimeString("pt-BR")}
                    </p>
                  </div>
                </div>

                {consent.status === "approved" && consent.scopes && (
                  <div className="rounded-lg bg-success/5 p-4">
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Key className="h-4 w-4 text-success" />
                      Artefato de Consentimento Gerado
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Token ID (JWT)</p>
                        <code className="mt-1 block rounded bg-muted px-2 py-1 text-xs font-mono">
                          {consent.tokenId}
                        </code>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Escopos Autorizados</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {consent.scopes.map((scope) => (
                            <Badge key={scope} variant="outline" className="text-xs">
                              {scope}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CollapsibleContent>
            </div>
          </Collapsible>
        </Card>
      ))}

      {consents.length === 0 && (
        <Card className="p-12 text-center">
          <FileCheck className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">Nenhum consentimento encontrado</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Crie uma nova manifestação de consentimento para começar
          </p>
        </Card>
      )}
    </div>
  );
};

export default ConsentList;
