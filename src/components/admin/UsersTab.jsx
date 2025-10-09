import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useTestMode } from '@/contexts/TestModeContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const UsersTab = ({ users, companies, onUpdate }) => {
  const [filter, setFilter] = useState('');
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const { toast } = useToast();
  const { enterTestMode } = useTestMode();

  const handleTestMode = (user) => {
    const company = companies.find(c => c.user_id === user.user_id);
    if (company) {
      enterTestMode(company);
    } else {
      toast({
        title: "Error",
        description: "No se encontró una empresa para este usuario.",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = useMemo(() =>
    users.filter(user =>
      user.email?.toLowerCase().includes(filter.toLowerCase()) ||
      user.company_name?.toLowerCase().includes(filter.toLowerCase())
    ), [users, filter]);

  const openDeleteAlert = (user) => {
    setUserToDelete(user);
    setDeleteAlertOpen(true);
  };

  const deleteUser = async () => {
    if (!userToDelete) return;
    
    toast({
      title: "🚧 Función en desarrollo",
      description: `La eliminación de usuarios estará disponible pronto.`,
    });
    setDeleteAlertOpen(false);
    setUserToDelete(null);
    //
    // try {
    //   // This needs a Supabase Edge Function with service_role key to delete users from auth.users
    //   const { error } = await supabase.functions.invoke('delete-user-admin', {
    //     body: { userId: userToDelete.id }
    //   });
    //   if (error) throw error;
    //
    //   toast({
    //     title: 'Usuario Eliminado',
    //     description: `El usuario ${userToDelete.email} ha sido eliminado.`,
    //   });
    //   onUpdate(); // Refresh data
    // } catch (error) {
    //   toast({
    //     variant: 'destructive',
    //     title: 'Error al eliminar',
    //     description: error.message,
    //   });
    // } finally {
    //   setDeleteAlertOpen(false);
    //   setUserToDelete(null);
    // }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Gestión de Empresas y Usuarios</h3>
        <div className="w-1/3">
          <Input
            placeholder="Filtrar por email o empresa..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rubros</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registrado</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map(user => (
              <motion.tr key={user.user_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.company_name || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.company_rubros?.join(', ') || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleTestMode(user)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver como Usuario
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast({ title: "🚧 En desarrollo" })}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => openDeleteAlert(user)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente al usuario
              <span className="font-bold"> {userToDelete?.email} </span>
              y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={deleteUser} className="bg-red-600 hover:bg-red-700">
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UsersTab;