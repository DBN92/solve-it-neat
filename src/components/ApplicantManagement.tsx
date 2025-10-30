import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
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
  FileText,
  Calendar,
  UserCheck,
  UserX,
  Loader2,
  CheckCircle,
  XCircle,
  Building,
  CreditCard
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
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editingApplicant) {
        onUpdateApplicant(editingApplicant.id, formData);
      } else {
        onNewApplicant(formData);
      }
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar solicitante:', error);
    } finally {
      setIsSubmitting(false);
    }
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

  // Estatísticas
  const stats = {
    total: applicants.length,
    active: applicants.filter(a => a.isActive).length,
    inactive: applicants.filter(a => !a.isActive).length,
    companies: applicants.filter(a => a.cnpj).length
  };

  return (
    <div className="animate-fade-in space-y-8">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Solicitantes</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Solicitantes Ativos</p>
                <p className="text-3xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Solicitantes Inativos</p>
                <p className="text-3xl font-bold text-red-600">{stats.inactive}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <UserX className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Empresas</p>
                <p className="text-3xl font-bold text-purple-600">{stats.companies}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <Building className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar solicitantes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              Novo Solicitante
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {editingApplicant ? 'Editar Solicitante' : 'Novo Solicitante'}
              </DialogTitle>
              <DialogDescription>
                {editingApplicant 
                  ? 'Atualize as informações do solicitante'
                  : 'Cadastre um novo solicitante que poderá criar manifestações de consentimento'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium">Nome/Razão Social *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Digite o nome ou razão social"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type" className="text-sm font-medium">Tipo de Solicitante *</Label>
                  <Input
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    placeholder="Ex: Seguradora, Banco, Fintech"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cnpj" className="text-sm font-medium">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    placeholder="00.000.000/0000-00"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="cpf" className="text-sm font-medium">CPF</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contato@empresa.com"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium">Telefone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                    className="mt-1"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address" className="text-sm font-medium">Endereço *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Rua, número, complemento"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="city" className="text-sm font-medium">Cidade *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="São Paulo"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state" className="text-sm font-medium">Estado *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="SP"
                    maxLength={2}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode" className="text-sm font-medium">CEP *</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    placeholder="00000-000"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="responsiblePerson" className="text-sm font-medium">Pessoa Responsável</Label>
                  <Input
                    id="responsiblePerson"
                    value={formData.responsiblePerson}
                    onChange={(e) => setFormData({ ...formData, responsiblePerson: e.target.value })}
                    placeholder="Nome do responsável"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {editingApplicant ? 'Atualizando...' : 'Cadastrando...'}
                    </>
                  ) : (
                    editingApplicant ? 'Atualizar' : 'Cadastrar'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Solicitantes */}
      <div className="space-y-4">
        {filteredApplicants.length === 0 ? (
          <Card className="overflow-hidden">
            <CardContent className="p-12 text-center">
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm ? 'Nenhum solicitante encontrado' : 'Nenhum solicitante cadastrado'}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchTerm 
                  ? 'Tente ajustar os termos de busca para encontrar o solicitante desejado.'
                  : 'Cadastre o primeiro solicitante para começar a gerenciar manifestações de consentimento.'
                }
              </p>
              {!searchTerm && (
                <Button 
                  onClick={() => setShowForm(true)} 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Primeiro Solicitante
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredApplicants.map((applicant) => (
            <Card key={applicant.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {applicant.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{applicant.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            className={`px-3 py-1 rounded-full font-medium ${
                              applicant.isActive 
                                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                                : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                            }`}
                          >
                            {applicant.isActive ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Ativo
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                Inativo
                              </>
                            )}
                          </Badge>
                          <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full font-medium">
                            <Building2 className="h-3 w-3 mr-1" />
                            {applicant.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Mail className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Email</p>
                          <p className="text-sm text-gray-900">{applicant.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="p-2 bg-green-100 rounded-full">
                          <Phone className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Telefone</p>
                          <p className="text-sm text-gray-900">{applicant.phone}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="p-2 bg-purple-100 rounded-full">
                          <MapPin className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Localização</p>
                          <p className="text-sm text-gray-900">{applicant.city}, {applicant.state}</p>
                        </div>
                      </div>
                      
                      {applicant.cnpj && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="p-2 bg-orange-100 rounded-full">
                            <CreditCard className="h-4 w-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">CNPJ</p>
                            <p className="text-sm text-gray-900">{applicant.cnpj}</p>
                          </div>
                        </div>
                      )}
                      
                      {applicant.responsiblePerson && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="p-2 bg-indigo-100 rounded-full">
                            <User className="h-4 w-4 text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Responsável</p>
                            <p className="text-sm text-gray-900">{applicant.responsiblePerson}</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="p-2 bg-gray-100 rounded-full">
                          <Calendar className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Cadastrado em</p>
                          <p className="text-sm text-gray-900">{applicant.createdAt.toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(applicant)}
                      className="hover:bg-blue-50 hover:border-blue-200 flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onToggleStatus(applicant.id)}
                      className={`flex items-center gap-2 ${
                        applicant.isActive 
                          ? 'hover:bg-red-50 hover:border-red-200 text-red-600' 
                          : 'hover:bg-green-50 hover:border-green-200 text-green-600'
                      }`}
                    >
                      {applicant.isActive ? (
                        <>
                          <XCircle className="h-4 w-4" />
                          Desativar
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Ativar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ApplicantManagement;