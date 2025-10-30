import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ConsentSystemLayout from "@/layouts/ConsentSystemLayout";
import { LoginForm } from "@/components/LoginForm";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";

const ConsentSystemContent: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sistema de Consentimentos</h1>
            <p className="text-gray-600">Faça login para acessar o sistema</p>
          </div>
          <LoginForm />
        </div>
      </div>
    );
  }

  if (!['superAdm', 'comercial', 'suporte'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
          <p className="text-gray-600 mb-4">Você não tem permissão para acessar este sistema.</p>
          <p className="text-sm text-gray-500">Entre em contato com o administrador se precisar de acesso.</p>
        </div>
      </div>
    );
  }

  return (
    <ConsentSystemLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <Index activeTab={activeTab} onTabChange={setActiveTab} />
    </ConsentSystemLayout>
  );
};

const ConsentSystem: React.FC = () => {
  return (
    <AuthProvider>
      <ConsentSystemContent />
    </AuthProvider>
  );
};

export default ConsentSystem;