import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Tag,
  BarChart2,
  Package,
  BookOpen,
  Bell,
  LayoutGrid,
  Settings,
  Users,
  MessageSquare
} from 'lucide-react';

function AdminTabs({ activeTab, setActiveTab, unreadMessagesCount }) {
  const tabs = [
    { id: 'overview', label: 'Resumen', icon: <LayoutGrid className="w-5 h-5" /> },
    { id: 'companies', label: 'Empresas y Usuarios', icon: <Users className="w-5 h-5" /> },
    { id: 'surveys', label: 'Encuestas', icon: <FileText className="w-5 h-5" /> },
    { id: 'messages', label: 'Buzón de mensajes', icon: <MessageSquare className="w-5 h-5" />, badge: unreadMessagesCount > 0 },
    { id: 'rubros', label: 'Rubros', icon: <Tag className="w-5 h-5" /> },
    { id: 'metrics', label: 'Métricas', icon: <BarChart2 className="w-5 h-5" /> },
    { id: 'plans', label: 'Planes', icon: <Package className="w-5 h-5" /> },
    { id: 'resources', label: 'Recursos', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notificaciones', icon: <Bell className="w-5 h-5" /> },
    { id: 'settings', label: 'Configuración', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-6 overflow-x-auto px-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center space-x-2 whitespace-nowrap py-4 px-2 font-medium text-sm transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="absolute top-3 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            )}
            {activeTab === tab.id && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                layoutId="underline"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default AdminTabs;