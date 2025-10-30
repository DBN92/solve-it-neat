import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LoginForm } from "@/components/LoginForm";
import GovBrLogin from "@/pages/GovBrLogin";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DataOwnerDashboard from "@/pages/DataOwnerDashboard";

const queryClient = new QueryClient();

function AppContent() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {!user ? (
          <>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/gov-br" element={<GovBrLogin />} />
            <Route path="/" element={<GovBrLogin />} />
            <Route path="*" element={<GovBrLogin />} />
          </>
        ) : user.role === 'data_owner' ? (
          <>
            <Route path="/" element={<DataOwnerDashboard />} />
            <Route path="/data-owner" element={<DataOwnerDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/gov-br" element={<GovBrLogin />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
