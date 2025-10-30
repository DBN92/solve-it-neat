import React, { useState, useEffect } from 'react';
import { User, UserRole, CreateUserRequest, UpdateUserRequest } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Users, Shield, Headphones, Crown, Loader2, Mail, Calendar, UserCheck, UserX, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/services/database';

// Mock de usuários (em produção viria de uma API)
const INITIAL_USERS: User[] = [
  {
    id: '1',
    name: 'Admin Sistema',
    email: 'admin@sistema.com',
    role: 'superAdm',
    active: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'João Comercial',
    email: 'comercial@sistema.com',
    role: 'comercial',
    active: true,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  },
  {
    id: '3',
    name: 'Maria Suporte',
    email: 'suporte@sistema.com',
    role: 'suporte',
    active: true,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03')
  }
];

const ROLE_LABELS = {
  superAdm: 'Super Admin',
  comercial: 'Comercial',
  suporte: 'Suporte',
  data_owner: 'Proprietário de Dados'
};

const ROLE_ICONS = {
  superAdm: Crown,
  comercial: Users,
  suporte: Headphones,
  data_owner: Shield
};

const ROLE_COLORS = {
  superAdm: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
  comercial: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
  suporte: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
  data_owner: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
};

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const [newUser, setNewUser] = useState<CreateUserRequest>({
    name: '',
    email: '',
    role: 'suporte',
    password: ''
  });

  // Carregar usuários da base de dados
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const usersData = await db.users.getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    // Verificar se email já existe
    const existingUser = await db.users.getUserByEmail(newUser.email);
    if (existingUser) {
      toast({
        title: "Erro",
        description: "Este email já está em uso",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const createdUser = await db.users.createUser(newUser);
      setUsers([...users, createdUser]);
      setNewUser({ name: '', email: '', role: 'suporte', password: '' });
      setIsCreateDialogOpen(false);
      
      toast({
        title: "Usuário criado",
        description: `${createdUser.name} foi adicionado ao sistema`
      });
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o usuário",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      setIsSubmitting(true);
      const updatedUser = await db.users.updateUser(editingUser.id, {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role
      });

      if (updatedUser) {
        setUsers(users.map(u => 
          u.id === editingUser.id ? updatedUser : u
        ));
        
        setIsEditDialogOpen(false);
        setEditingUser(null);
        
        toast({
          title: "Usuário atualizado",
          description: `${updatedUser.name} foi atualizado com sucesso`
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o usuário",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    try {
      const updatedUser = await db.users.updateUser(userId, {
        active: !user.active
      });

      if (updatedUser) {
        setUsers(users.map(u => 
          u.id === userId ? updatedUser : u
        ));
        
        toast({
          title: user.active ? "Usuário desativado" : "Usuário ativado",
          description: `${user.name} foi ${user.active ? 'desativado' : 'ativado'}`
        });
      }
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do usuário",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    if (user.role === 'superAdm' && users.filter(u => u.role === 'superAdm').length === 1) {
      toast({
        title: "Erro",
        description: "Não é possível excluir o último Super Admin",
        variant: "destructive"
      });
      return;
    }

    try {
      const success = await db.users.deleteUser(userId);
      if (success) {
        setUsers(users.filter(u => u.id !== userId));
        toast({
          title: "Usuário excluído",
          description: `${user.name} foi removido do sistema`
        });
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o usuário",
        variant: "destructive"
      });
    }
  };

  // Filtrar usuários baseado no termo de busca
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ROLE_LABELS[user.role].toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Estatísticas
  const stats = {
    total: users.length,
    active: users.filter(u => u.active).length,
    inactive: users.filter(u => !u.active).length,
    superAdmins: users.filter(u => u.role === 'superAdm').length
  };

  return (
    <div className="animate-fade-in space-y-8">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
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
                <p className="text-sm font-medium text-gray-600">Usuários Inativos</p>
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
                <p className="text-sm font-medium text-gray-600">Super Admins</p>
                <p className="text-3xl font-bold text-purple-600">{stats.superAdmins}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <Crown className="h-6 w-6 text-purple-600" />
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
            placeholder="Buscar usuários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Criar Novo Usuário</DialogTitle>
              <DialogDescription>
                Adicione um novo usuário ao sistema com as permissões apropriadas
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">Nome Completo</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Digite o nome completo"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="usuario@exemplo.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-sm font-medium">Senha Temporária</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Senha temporária"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="role" className="text-sm font-medium">Função</Label>
                <Select value={newUser.role} onValueChange={(value: UserRole) => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="suporte">
                      <div className="flex items-center gap-2">
                        <Headphones className="h-4 w-4" />
                        Suporte
                      </div>
                    </SelectItem>
                    <SelectItem value="comercial">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Comercial
                      </div>
                    </SelectItem>
                    <SelectItem value="superAdm">
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4" />
                        Super Admin
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCreateUser}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    'Criar Usuário'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Usuários */}
      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <CardTitle className="text-xl font-semibold text-gray-900">Usuários do Sistema</CardTitle>
          <CardDescription>
            Gerencie usuários, permissões e status de acesso
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Carregando usuários...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Tente ajustar os termos de busca.'
                  : 'Adicione o primeiro usuário para começar.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Usuário</TableHead>
                    <TableHead className="font-semibold">Função</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Criado em</TableHead>
                    <TableHead className="font-semibold text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const RoleIcon = ROLE_ICONS[user.role] || Users; // Fallback para Users se o role não existir
                    return (
                      <TableRow key={user.id} className="hover:bg-gray-50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Mail className="h-3 w-3" />
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${ROLE_COLORS[user.role]} px-3 py-1 rounded-full font-medium`}>
                            <RoleIcon className="h-3 w-3 mr-1" />
                            {ROLE_LABELS[user.role]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={user.active}
                              onCheckedChange={() => handleToggleUserStatus(user.id)}
                              className="data-[state=checked]:bg-green-600"
                            />
                            <span className={`text-sm font-medium ${user.active ? 'text-green-600' : 'text-red-600'}`}>
                              {user.active ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="h-3 w-3" />
                            {user.createdAt.toLocaleDateString('pt-BR')}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditUser(user)}
                              className="hover:bg-blue-50 hover:border-blue-200"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              className="hover:bg-red-50 hover:border-red-200 text-red-600"
                              disabled={user.role === 'superAdm' && users.filter(u => u.role === 'superAdm').length === 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Editar Usuário</DialogTitle>
            <DialogDescription>
              Atualize as informações do usuário
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name" className="text-sm font-medium">Nome Completo</Label>
                <Input
                  id="edit-name"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-email" className="text-sm font-medium">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-role" className="text-sm font-medium">Função</Label>
                <Select 
                  value={editingUser.role} 
                  onValueChange={(value: UserRole) => setEditingUser({ ...editingUser, role: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="suporte">
                      <div className="flex items-center gap-2">
                        <Headphones className="h-4 w-4" />
                        Suporte
                      </div>
                    </SelectItem>
                    <SelectItem value="comercial">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Comercial
                      </div>
                    </SelectItem>
                    <SelectItem value="superAdm">
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4" />
                        Super Admin
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingUser(null);
                  }}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleUpdateUser}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Atualizando...
                    </>
                  ) : (
                    'Atualizar'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}