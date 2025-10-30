import React, { useState, useEffect } from "react";
import DataOwnerPortal from "@/apps/DataOwnerPortal";
import ConsentSystem from "@/apps/ConsentSystem";

// Enum para os tipos de aplicação
export enum AppType {
  DATA_OWNER_PORTAL = 'data-owner-portal',
  CONSENT_SYSTEM = 'consent-system'
}

// Interface para configuração da aplicação
interface AppConfig {
  type: AppType;
  title: string;
  description: string;
}

const AppRouter: React.FC = () => {
  const [currentApp, setCurrentApp] = useState<AppType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Detectar qual aplicação carregar baseado na URL ou configuração
    const detectApp = () => {
      const hostname = window.location.hostname;
      const pathname = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      
      // Verificar parâmetro de URL para forçar uma aplicação específica
      const appParam = searchParams.get('app');
      if (appParam === 'portal') {
        setCurrentApp(AppType.DATA_OWNER_PORTAL);
        return;
      }
      if (appParam === 'sistema') {
        setCurrentApp(AppType.CONSENT_SYSTEM);
        return;
      }

      // Detectar baseado no subdomínio
      if (hostname.startsWith('portal.') || hostname.includes('titular')) {
        setCurrentApp(AppType.DATA_OWNER_PORTAL);
        return;
      }
      
      if (hostname.startsWith('admin.') || hostname.includes('sistema')) {
        setCurrentApp(AppType.CONSENT_SYSTEM);
        return;
      }

      // Detectar baseado no path
      if (pathname.startsWith('/portal') || pathname.startsWith('/titular')) {
        setCurrentApp(AppType.DATA_OWNER_PORTAL);
        return;
      }

      if (pathname.startsWith('/admin') || pathname.startsWith('/sistema')) {
        setCurrentApp(AppType.CONSENT_SYSTEM);
        return;
      }

      // Verificar localStorage para preferência do usuário
      const savedApp = localStorage.getItem('preferred_app');
      if (savedApp && Object.values(AppType).includes(savedApp as AppType)) {
        setCurrentApp(savedApp as AppType);
        return;
      }

      // Default: mostrar seletor de aplicação
      setCurrentApp(null);
    };

    detectApp();
    setIsLoading(false);
  }, []);

  const handleAppSelection = (appType: AppType) => {
    setCurrentApp(appType);
    localStorage.setItem('preferred_app', appType);
    
    // Atualizar URL para refletir a seleção
    const url = new URL(window.location.href);
    url.searchParams.set('app', appType === AppType.DATA_OWNER_PORTAL ? 'portal' : 'sistema');
    window.history.pushState({}, '', url.toString());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando aplicação...</p>
        </div>
      </div>
    );
  }

  // Se uma aplicação específica foi detectada, renderizá-la
  if (currentApp === AppType.DATA_OWNER_PORTAL) {
    return <DataOwnerPortal />;
  }

  if (currentApp === AppType.CONSENT_SYSTEM) {
    return <ConsentSystem />;
  }

  // Seletor de aplicação
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sistema LGPD
          </h1>
          <p className="text-xl text-gray-600">
            Selecione a aplicação que deseja acessar
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Portal do Titular */}
          <div 
            className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            onClick={() => handleAppSelection(AppType.DATA_OWNER_PORTAL)}
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Portal do Titular
              </h2>
              <p className="text-gray-600 mb-6">
                Acesse e gerencie seus consentimentos de dados pessoais de forma segura e transparente.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>✓ Visualizar consentimentos</p>
                <p>✓ Aprovar/Rejeitar solicitações</p>
                <p>✓ Revogar autorizações</p>
                <p>✓ Histórico de ações</p>
              </div>
            </div>
          </div>

          {/* Sistema de Consentimento */}
          <div 
            className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            onClick={() => handleAppSelection(AppType.CONSENT_SYSTEM)}
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-full mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Sistema de Consentimento
              </h2>
              <p className="text-gray-600 mb-6">
                Plataforma administrativa para gestão completa de solicitações e consentimentos LGPD.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>✓ Criar solicitações</p>
                <p>✓ Gerenciar usuários</p>
                <p>✓ Relatórios e estatísticas</p>
                <p>✓ Administração completa</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Sua escolha será lembrada para próximas visitas
          </p>
        </div>
      </div>
    </div>
  );
};

export default AppRouter;