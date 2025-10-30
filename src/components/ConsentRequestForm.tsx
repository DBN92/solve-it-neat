import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ConsentRequest, Applicant } from "@/pages/Index";
import { Send } from "lucide-react";

interface ConsentRequestFormProps {
  onSubmit: (consent: Omit<ConsentRequest, "id" | "status" | "createdAt">) => void;
  applicants: Applicant[];
}

const ConsentRequestForm = ({ onSubmit, applicants }: ConsentRequestFormProps) => {
  const [formData, setFormData] = useState({
    dataUser: "",
    dataUserType: "",
    dataOwner: "",
    cpf: "",
    dataTypes: [] as string[],
    purpose: "",
    legalBasis: "",
    deadline: "",
    controller: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const consentData = {
      ...formData,
      lastModified: new Date(),
      actionHistory: [{
        id: crypto.randomUUID(),
        action: "created" as const,
        timestamp: new Date(),
        performedBy: "user" as const,
      }],
    };
    onSubmit(consentData);
    setFormData({
      dataUser: "",
      dataUserType: "",
      dataOwner: "",
      cpf: "",
      dataTypes: [],
      purpose: "",
      legalBasis: "",
      deadline: "",
      controller: "",
    });
  };

  const legalBasisOptions = [
    "Consentimento explícito do titular",
    "Execução de contrato",
    "Cumprimento de obrigação legal ou regulatória",
    "Exercício regular de direitos",
    "Proteção da vida ou incolumidade física",
    "Tutela da saúde",
  ];

  const dataUserTypes = [
    "Seguradora",
    "App de Mobilidade",
    "Despachante",
    "Sistema Governamental",
    "Instituição Financeira",
    "Plataforma de Emprego",
    "Outro",
  ];

  const availableDataTypes = [
    { id: "cnh", label: "CNH (Carteira Nacional de Habilitação)" },
    { id: "veiculos", label: "Veículos (Registro de propriedade)" },
    { id: "multas", label: "Multas (Infrações de trânsito)" },
    { id: "pontuacao", label: "Pontuação (Pontos na carteira)" },
  ];

  const handleDataTypeToggle = (dataType: string) => {
    setFormData((prev) => ({
      ...prev,
      dataTypes: prev.dataTypes.includes(dataType)
        ? prev.dataTypes.filter((t) => t !== dataType)
        : [...prev.dataTypes, dataType],
    }));
  };

  return (
    <Card className="mx-auto max-w-3xl p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg bg-primary/5 p-4 border border-primary/20">
          <h3 className="font-semibold text-foreground mb-2">Informações do Solicitante</h3>
          <p className="text-sm text-muted-foreground">
            Dados da organização que está solicitando acesso aos dados via Senatran
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="dataUser">Solicitante *</Label>
            <Select
              value={formData.dataUser}
              onValueChange={(value) => {
                const selectedApplicant = applicants.find(app => app.name === value);
                setFormData({ 
                  ...formData, 
                  dataUser: value,
                  dataUserType: selectedApplicant?.type || ""
                });
              }}
            >
              <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary">
                <SelectValue placeholder="Selecione um solicitante cadastrado" />
              </SelectTrigger>
              <SelectContent>
                {applicants.filter(app => app.isActive).map((applicant) => (
                  <SelectItem key={applicant.id} value={applicant.name}>
                    {applicant.name} - {applicant.type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {applicants.filter(app => app.isActive).length === 0 && (
              <p className="text-sm text-amber-600">
                Nenhum solicitante ativo encontrado. Cadastre um solicitante na aba "Solicitante" primeiro.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataUserType">Tipo de Solicitante *</Label>
            <Input
              id="dataUserType"
              value={formData.dataUserType}
              readOnly
              placeholder="Será preenchido automaticamente"
              className="bg-muted transition-all focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="controller">Razão Social do Controlador *</Label>
          <Input
            id="controller"
            placeholder="Ex: Porto Seguro Companhia de Seguros Gerais"
            value={formData.controller}
            onChange={(e) => setFormData({ ...formData, controller: e.target.value })}
            required
            className="transition-all focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="rounded-lg bg-secondary/5 p-4 border border-secondary/20">
          <h3 className="font-semibold text-foreground mb-2">Dados do Titular</h3>
          <p className="text-sm text-muted-foreground">
            Informações do cidadão que autorizará o acesso aos seus dados
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="dataOwner">Nome do Titular *</Label>
            <Input
              id="dataOwner"
              placeholder="Ex: João da Silva Santos"
              value={formData.dataOwner}
              onChange={(e) => setFormData({ ...formData, dataOwner: e.target.value })}
              required
              className="transition-all focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf">CPF do Titular *</Label>
            <Input
              id="cpf"
              placeholder="000.000.000-00"
              value={formData.cpf}
              onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
              required
              maxLength={14}
              className="transition-all focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label>Tipos de Dados Solicitados *</Label>
          <div className="rounded-lg border border-input p-4 space-y-3">
            {availableDataTypes.map((dataType) => (
              <div key={dataType.id} className="flex items-start space-x-3">
                <Checkbox
                  id={dataType.id}
                  checked={formData.dataTypes.includes(dataType.label.split(" (")[0])}
                  onCheckedChange={() => handleDataTypeToggle(dataType.label.split(" (")[0])}
                />
                <label
                  htmlFor={dataType.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {dataType.label}
                </label>
              </div>
            ))}
          </div>
          {formData.dataTypes.length === 0 && (
            <p className="text-sm text-muted-foreground">Selecione ao menos um tipo de dado</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="purpose">Finalidade do Acesso *</Label>
          <Textarea
            id="purpose"
            placeholder="Descreva de forma clara e específica a finalidade do acesso aos dados do titular"
            value={formData.purpose}
            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            required
            rows={4}
            className="resize-none transition-all focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="legalBasis">Base Legal (LGPD) *</Label>
            <Select
              value={formData.legalBasis}
              onValueChange={(value) => setFormData({ ...formData, legalBasis: value })}
            >
              <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary">
                <SelectValue placeholder="Selecione a base legal" />
              </SelectTrigger>
              <SelectContent>
                {legalBasisOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Validade do Consentimento *</Label>
            <Input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              required
              min={new Date().toISOString().split("T")[0]}
              className="transition-all focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setFormData({
                dataUser: "",
                dataUserType: "",
                dataOwner: "",
                cpf: "",
                dataTypes: [],
                purpose: "",
                legalBasis: "",
                deadline: "",
                controller: "",
              })
            }
          >
            Limpar Formulário
          </Button>
          <Button type="submit" disabled={formData.dataTypes.length === 0} className="gap-2">
            <Send className="h-4 w-4" />
            Solicitar Consentimento
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ConsentRequestForm;
