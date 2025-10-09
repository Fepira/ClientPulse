import React from 'react';
import { Helmet } from 'react-helmet';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import { UserRoleProvider } from '@/contexts/UserRoleContext';
import { TestModeProvider } from '@/contexts/TestModeContext';
import { Toaster } from '@/components/ui/toaster';
import AppRouter from '@/components/AppRouter';

function App() {
  return (
    <>
      <Helmet>
        <title>Client Pulse - El Pulso de tu Negocio</title>
        <meta name="description" content="Plataforma líder en medición de satisfacción de clientes con encuestas inteligentes, benchmarking sectorial y análisis en tiempo real para empresas chilenas." />
        <link rel="icon" type="image/png" href="https://horizons-cdn.hostinger.com/1a278a57-ddc3-48d4-9216-30f7b1b4e998/7aa21c64fa4b18ce9580c21f04d166b1.png" />
      </Helmet>
      
      <AuthProvider>
        <UserRoleProvider>
          <TestModeProvider>
            <AppRouter />
          </TestModeProvider>
        </UserRoleProvider>
      </AuthProvider>
      <Toaster />
    </>
  );
}

export default App;