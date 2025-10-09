import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UsersTab from '@/components/admin/UsersTab';
import RecentActivityTab from '@/components/admin/RecentActivityTab';
import { Users, Activity } from 'lucide-react';

function CompaniesTab({ users, companies, onUpdate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');

  return (
    <Tabs defaultValue="users" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="users"><Users className="w-4 h-4 mr-2" />Usuarios y Empresas</TabsTrigger>
        <TabsTrigger value="activity"><Activity className="w-4 h-4 mr-2" />Actividades Recientes</TabsTrigger>
      </TabsList>
      <TabsContent value="users" className="mt-4">
        <UsersTab 
          users={users} 
          companies={companies} 
          onUpdate={onUpdate} 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterPlan={filterPlan}
          setFilterPlan={setFilterPlan}
        />
      </TabsContent>
      <TabsContent value="activity" className="mt-4">
        <RecentActivityTab />
      </TabsContent>
    </Tabs>
  );
}

export default CompaniesTab;