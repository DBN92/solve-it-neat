import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  User, 
  Edit, 
  ToggleLeft, 
  ToggleRight,
  Search,
  FileText
} from 'lucide-react';

interface Applicant {
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

interface ApplicantManagementProps {
  applicants: Applicant[];
  onNewApplicant: (applicant: Omit<Applicant, "id" | "createdAt">) => void;
  onUpdateApplicant: (id: string, updatedApplicant: Partial<Applicant>) => void;
  onToggleStatus: (id: string) => void;
}

const ApplicantManagement: React.FC<ApplicantManagementProps> = ({
  applicants,
  onNewApplicant,
  onUpdateApplicant,
  onToggleStatus
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingApplicant, setEditingApplicant] = useState<Applicant | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    cnpj: '',
    cpf: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    responsiblePerson: '',
    isActive: true
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      cnpj: '',
      cpf: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      responsiblePerson: '',
      isActive: true
    });
    setShowForm(false);
    setEditingApplicant(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingApplicant) {
      onUpdateApplicant(editingApplicant.id, formData);
    } else {
      onNewApplicant(formData);
    }
    
    resetForm();
  };

  const handleEdit = (applicant: Applicant) => {
    setFormData({
      name: applicant.name,
      type: applicant.type,
      cnpj: applicant.cnpj || '',
      cpf: applicant.cpf || '',
      email: applicant.email,
      phone: applicant.phone,
      address: applicant.address,
      city: applicant.city,
      state: applicant.state,
      zipCode: applicant.zipCode,
      responsiblePerson: applicant.responsiblePerson || '',
      isActive: applicant.isActive
    });
    setEditingApplicant(applicant);
    setShowForm(true);
  };

  const filteredApplicants = applicants.filter(applicant =>
    applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    applicant.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    applicant.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeApplicants = applicants.filter(a => a.isActive).length;
  const inactiveApplicants = applicants.filter(a => !a.isActive).length;

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h2 className="mb-2 text-3xl font-bold text-foreground">Gerenciamento de Solicitantes</h2>
        <p className="text-muted-foreground">
          Cadastre e gerencie os solicitantes que podem criar manifestações de consentimento
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Solicitantes</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applicants.length}</div>
            <p className="text-xs text-muted-foreground">
              Solicitantes cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <User className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeApplicants}</div>
            <p className="text-xs text-muted-foreground">
              Podem criar manifestações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inativos</CardTitle>
            <User className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{inactiveApplicants}</div>
            <p className="text-xs text-muted-foreground">
              Bloqueados temporariamente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controles */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar solicitantes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Solicitante
        </Button>
      </div>

      {/* Formulário */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {editingApplicant ? 'Editar Solicitante' : 'Novo Solicitante'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome/Razão Social *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Tipo *</Label>
                  <Input
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    placeholder="Ex: Seguradora, Banco, Fintech"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Endereço *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="city">Cidade *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">Estado *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="SP"
                    maxLength={2}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">CEP *</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    placeholder="00000-000"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="responsiblePerson">Pessoa Responsável</Label>
                  <Input
                    id="responsiblePerson"
                    value={formData.responsiblePerson}
                    onChange={(e) => setFormData({ ...formData, responsiblePerson: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingApplicant ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Solicitantes */}
      <div className="space-y-4">
        {filteredApplicants.map((applicant) => (
          <Card key={applicant.id} className="transition-shadow hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">{applicant.name}</h3>
                    <Badge variant={applicant.isActive ? "default" : "secondary"}>
                      {applicant.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                    <Badge variant="outline">{applicant.type}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {applicant.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {applicant.phone}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {applicant.city}, {applicant.state}
                    </div>
                    {applicant.cnpj && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        CNPJ: {applicant.cnpj}
                      </div>
                    )}
                    {applicant.responsiblePerson && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {applicant.responsiblePerson}
                      </div>
                    )}
                    <div className="text-xs">
                      Cadastrado em: {applicant.createdAt.toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(applicant)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleStatus(applicant.id)}
                    className={`flex items-center gap-1 ${
                      applicant.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'
                    }`}
                  >
                    {applicant.isActive ? (
                      <>
                        <ToggleRight className="h-4 w-4" />
                        Desativar
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="h-4 w-4" />
                        Ativar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredApplicants.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchTerm ? 'Nenhum solicitante encontrado' : 'Nenhum solicitante cadastrado'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Tente ajustar os termos de busca.'
                  : 'Cadastre o primeiro solicitante para começar a gerenciar manifestações de consentimento.'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Cadastrar Primeiro Solicitante
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ApplicantManagement;