import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import DataOwnerLayout from "@/layouts/DataOwnerLayout";
import GovBrLogin from "@/pages/GovBrLogin";
import DataOwnerDashboard from "@/pages/DataOwnerDashboard";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function DataOwnerPortalContent() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {!user ? (
          <>
            <Route path="/" element={<GovBrLogin />} />
            <Route path="/gov-br" element={<GovBrLogin />} />
            <Route path="/login" element={<GovBrLogin />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : user.role === 'data_owner' ? (
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
                <p className="text-sm text-gray-500">Este portal é exclusivo para titulares de dados.</p>
              </div>
            </div>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

const DataOwnerPortal: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <DataOwnerPortalContent />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default DataOwnerPortal;