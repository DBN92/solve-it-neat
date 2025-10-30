import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { User, LogOut, Shield, Home, FileText, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/Logo';

interface DataOwnerLayoutProps {
  children: React.ReactNode;
}

const DataOwnerLayout: React.FC<DataOwnerLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Logo />
            <div className="border-l border-gray-300 pl-4">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Portal do Titular
              </h1>
              <p className="text-sm text-gray-600">Gerencie seus dados pessoais</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Navegação */}
            <nav className="hidden md:flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600">
                <Home className="w-4 h-4 mr-2" />
                Início
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600">
                <FileText className="w-4 h-4 mr-2" />
                Consentimentos
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600">
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-600 flex items-center">
                  <Shield className="w-3 h-3 mr-1" />
                  Titular de Dados
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="rounded-full">
                    <User className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={logout} className="text-red-600 hover:bg-red-50">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair do Portal
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 px-6 py-4 mt-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div className="text-sm text-gray-600">
              © 2024 Portal do Titular - Sistema LGPD
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <Shield className="w-4 h-4 mr-1 text-green-500" />
                Conexão Segura
              </span>
              <span>•</span>
              <span>Seus dados estão protegidos</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DataOwnerLayout;