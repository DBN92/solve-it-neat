import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LoginForm } from "@/components/LoginForm";
import DataOwnerLayout from "@/layouts/DataOwnerLayout";
import GovBrLogin from "@/pages/GovBrLogin";
import DataOwnerDashboard from "@/pages/DataOwnerDashboard";
import NotFound from "@/pages/NotFound";

function DataOwnerPortalContent() {
  const { user, loginWithGovBr, isLoading } = useAuth();

  // Login automático com CPF 12345678900 (apenas na primeira visita)
  useEffect(() => {
    const performAutoLogin = async () => {
      // Verificar se já foi feito logout manual (flag no localStorage)
      const hasLoggedOut = localStorage.getItem('data_owner_logged_out');
      
      if (!user && !isLoading && !hasLoggedOut) {
        console.log('🔄 Iniciando login automático para CPF 12345678900');
        
        const govBrData = {
          cpf: '12345678900',
          name: 'João Silva',
          email: 'joao.silva@exemplo.com',
          phone: '(11) 99999-9999',
          birthDate: '1990-01-01'
        };

        try {
          const success = await loginWithGovBr(govBrData);
          if (success) {
            console.log('✅ Login automático realizado com sucesso');
          } else {
            console.log('❌ Falha no login automático');
          }
        } catch (error) {
          console.error('💥 Erro no login automático:', error);
        }
      }
    };

    performAutoLogin();
  }, [user, isLoading, loginWithGovBr]);

  // Debug logs
  console.log('🔍 DataOwnerPortal - User:', user);
  console.log('🔍 DataOwnerPortal - User role:', user?.role);
  console.log('🔍 DataOwnerPortal - Is data_owner?', user?.role === 'data_owner');

  // Mostrar loading durante o login automático
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Realizando login automático...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {!user ? (
        <>
          {/* Se o usuário fez logout manual, redirecionar para a página inicial */}
          {localStorage.getItem('data_owner_logged_out') ? (
            <Route path="*" element={<Navigate to="/" replace />} />
          ) : (
            <>
              <Route path="/" element={<GovBrLogin />} />
              <Route path="/gov-br" element={<GovBrLogin />} />
              <Route path="/login" element={
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <div className="max-w-md w-full">
                    <div className="text-center mb-8">
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">Portal do Titular</h1>
                      <p className="text-gray-600">Faça login para acessar o portal</p>
                    </div>
                    <LoginForm />
                  </div>
                </div>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </>
      ) : (user.role === 'data_owner' || user.role === 'superAdm') ? (
        <>
          <Route path="/" element={<DataOwnerLayout><DataOwnerDashboard /></DataOwnerLayout>} />
          <Route path="/dashboard" element={<DataOwnerLayout><DataOwnerDashboard /></DataOwnerLayout>} />
          <Route path="/consentimentos" element={<DataOwnerLayout><DataOwnerDashboard /></DataOwnerLayout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      ) : (
        <>
          <Route path="/" element={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
              <p className="text-gray-600 mb-4">Você não tem permissão para acessar o Portal do Titular.</p>
              <p className="text-sm text-gray-500">Este portal é exclusivo para titulares de dados e administradores.</p>
              <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left">
                <p className="text-xs text-gray-600">Debug Info:</p>
                <p className="text-xs text-gray-600">User: {user?.name}</p>
                <p className="text-xs text-gray-600">Role: {user?.role}</p>
                <p className="text-xs text-gray-600">Expected: data_owner ou superAdm</p>
              </div>
            </div>
          </div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  );
}

const DataOwnerPortal: React.FC = () => {
  return (
    <AuthProvider>
      <DataOwnerPortalContent />
    </AuthProvider>
  );
};

export default DataOwnerPortal;