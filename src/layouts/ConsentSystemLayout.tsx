import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { User, LogOut, Settings, BarChart3, Users, FileText, Home, Building } from 'lucide-react';
import { useAuth, usePermissions } from '@/contexts/AuthContext';
import Logo from '@/components/Logo';

interface ConsentSystemLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const ConsentSystemLayout: React.FC<ConsentSystemLayoutProps> = ({ 
  children, 
  activeTab = "dashboard",
  onTabChange 
}) => {
  const { user, logout } = useAuth();
  const { hasPermission } = usePermissions();

  const handleTabClick = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/20 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Logo size="md" showText={true} />
            
            <div className="flex items-center gap-6">
              {/* Navigation */}
              <nav className="hidden md:flex items-center gap-1 bg-gray-50/80 rounded-full p-1 backdrop-blur-sm">
                {hasPermission("dashboard") && (
                  <Button
                    variant={activeTab === "dashboard" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleTabClick("dashboard")}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      activeTab === "dashboard" 
                        ? "bg-white shadow-md text-blue-700 hover:bg-white" 
                        : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                    }`}
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                )}
                {hasPermission("consents") && (
                  <Button
                    variant={activeTab === "consents" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleTabClick("consents")}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      activeTab === "consents" 
                        ? "bg-white shadow-md text-blue-700 hover:bg-white" 
                        : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                    }`}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Consentimentos
                  </Button>
                )}
                {hasPermission("users") && (
                  <Button
                    variant={activeTab === "users" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleTabClick("users")}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      activeTab === "users" 
                        ? "bg-white shadow-md text-blue-700 hover:bg-white" 
                        : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                    }`}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Usuários
                  </Button>
                )}
                {hasPermission("applicant") && (
                  <Button
                    variant={activeTab === "applicant" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleTabClick("applicant")}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      activeTab === "applicant" 
                        ? "bg-white shadow-md text-blue-700 hover:bg-white" 
                        : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                    }`}
                  >
                    <Building className="w-4 h-4 mr-2" />
                    Solicitantes
                  </Button>
                )}
                <Button
                  variant={activeTab === "settings" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleTabClick("settings")}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    activeTab === "settings" 
                      ? "bg-white shadow-md text-blue-700 hover:bg-white" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                  }`}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </Button>
              </nav>
              
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex items-center gap-2 hover:bg-white/50 rounded-full px-3 py-2 transition-all duration-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-600 capitalize">{user?.role}</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white/95 backdrop-blur-sm border-white/20">
                  <DropdownMenuItem onClick={logout} className="text-red-600 hover:bg-red-50 transition-colors">
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
      <main className="container mx-auto px-6 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-sm border-t border-gray-200 py-4 px-6">
        <div className="container mx-auto flex items-center justify-between text-sm text-gray-600">
          <p>&copy; 2024 Sistema de Consentimento. Todos os direitos reservados.</p>
          <p className="text-orange-600 font-medium">Ambiente Administrativo</p>
        </div>
      </footer>
    </div>
  );
};

export default ConsentSystemLayout;