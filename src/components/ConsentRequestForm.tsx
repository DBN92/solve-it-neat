import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConsentRequest } from "@/pages/Index";
import { Send } from "lucide-react";

interface ConsentRequestFormProps {
  onSubmit: (consent: Omit<ConsentRequest, "id" | "status" | "createdAt">) => void;
}

const ConsentRequestForm = ({ onSubmit }: ConsentRequestFormProps) => {
  const [formData, setFormData] = useState({
    dataUser: "",
    dataOwner: "",
    purpose: "",
    legalBasis: "",
    deadline: "",
    controller: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      dataUser: "",
      dataOwner: "",
      purpose: "",
      legalBasis: "",
      deadline: "",
      controller: "",
    });
  };

  const legalBasisOptions = [
    "Consentimento explícito",
    "Execução de contrato",
    "Interesse legítimo",
    "Obrigação legal",
    "Proteção da vida",
    "Exercício regular de direitos",
  ];

  return (
    <Card className="mx-auto max-w-3xl p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="dataUser">Usuário de Dado *</Label>
            <Input
              id="dataUser"
              placeholder="Nome do sistema/aplicação"
              value={formData.dataUser}
              onChange={(e) => setFormData({ ...formData, dataUser: e.target.value })}
              required
              className="transition-all focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataOwner">Titular do Dado *</Label>
            <Input
              id="dataOwner"
              placeholder="Nome do titular"
              value={formData.dataOwner}
              onChange={(e) => setFormData({ ...formData, dataOwner: e.target.value })}
              required
              className="transition-all focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="purpose">Finalidade *</Label>
          <Textarea
            id="purpose"
            placeholder="Descreva a finalidade do tratamento dos dados"
            value={formData.purpose}
            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            required
            rows={4}
            className="resize-none transition-all focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="legalBasis">Base Legal *</Label>
            <Select value={formData.legalBasis} onValueChange={(value) => setFormData({ ...formData, legalBasis: value })}>
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
            <Label htmlFor="deadline">Prazo *</Label>
            <Input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              required
              className="transition-all focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="controller">Controlador *</Label>
          <Input
            id="controller"
            placeholder="Nome do controlador de dados"
            value={formData.controller}
            onChange={(e) => setFormData({ ...formData, controller: e.target.value })}
            required
            className="transition-all focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setFormData({
                dataUser: "",
                dataOwner: "",
                purpose: "",
                legalBasis: "",
                deadline: "",
                controller: "",
              })
            }
          >
            Limpar
          </Button>
          <Button type="submit" className="gap-2">
            <Send className="h-4 w-4" />
            Enviar Manifestação
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ConsentRequestForm;
