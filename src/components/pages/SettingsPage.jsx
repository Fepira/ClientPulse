import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, CreditCard, Plug, Settings as SettingsIcon } from 'lucide-react'; // Removed Building icon

import ProfileSettings from '@/components/settings/ProfileSettings';
import SubscriptionSettings from '@/components/settings/SubscriptionSettings';
import IntegrationsSettings from '@/components/settings/IntegrationsSettings';
import AppSettings from '@/components/settings/AppSettings';

function SettingsPage({ company, onCompanyUpdate }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <Helmet>
        <title>Configuración - Client Pulse</title>
        <meta name="description" content="Gestiona tu perfil, información de la empresa, suscripción y configuraciones de la aplicación en Client Pulse." />
      </Helmet>

      <h2 className="text-3xl font-bold text-gray-800">Configuración de la Cuenta y Empresa</h2>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4"> {/* Adjusted grid-cols */}
          <TabsTrigger value="profile"><User className="w-4 h-4 mr-2" /> Perfil</TabsTrigger>
          {/* Removed Company tab trigger */}
          <TabsTrigger value="subscription"><CreditCard className="w-4 h-4 mr-2" /> Suscripción</TabsTrigger>
          <TabsTrigger value="integrations"><Plug className="w-4 h-4 mr-2" /> Integraciones</TabsTrigger>
          <TabsTrigger value="app-settings"><SettingsIcon className="w-4 h-4 mr-2" /> App</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="glass-effect p-6 rounded-lg mt-4">
          <ProfileSettings />
        </TabsContent>

        {/* Removed Company TabsContent */}

        <TabsContent value="subscription" className="glass-effect p-6 rounded-lg mt-4">
          <SubscriptionSettings company={company} onCompanyUpdate={onCompanyUpdate} />
        </TabsContent>

        <TabsContent value="integrations" className="glass-effect p-6 rounded-lg mt-4">
          <IntegrationsSettings />
        </TabsContent>

        <TabsContent value="app-settings" className="glass-effect p-6 rounded-lg mt-4">
          <AppSettings company={company} onCompanyUpdate={onCompanyUpdate} />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

export default SettingsPage;