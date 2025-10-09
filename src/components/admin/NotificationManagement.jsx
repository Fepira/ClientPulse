import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Send, History, Mail, Bell, Trash2 } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const NotificationManagement = ({ users, onUpdate }) => {
  const { toast } = useToast();
  const [notification, setNotification] = useState({
    title: '',
    description: '',
    notification_type: 'in-app',
    segment: 'all',
    link: '',
    status: 'sent'
  });
  const [pastNotifications, setPastNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPastNotifications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100); // Fetch a reasonable number of past notifications
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo cargar el historial de notificaciones.' });
    } else {
      setPastNotifications(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPastNotifications();
  }, []);

  const handleSend = async () => {
    if (!notification.title || !notification.description) {
      toast({ variant: 'destructive', description: 'El título y el mensaje son requeridos.' });
      return;
    }
    setLoading(true);

    try {
      const { data: adminUser, error: adminError } = await supabase.auth.getUser();
      if (adminError || !adminUser) throw new Error("No se pudo identificar al administrador.");

      let targetUsers = [];
      if (notification.segment === 'all') {
        targetUsers = users.filter(u => u.role === 'user').map(u => u.user_id);
      } else {
        const { data: companies, error } = await supabase
          .from('companies')
          .select('user_id')
          .eq('plan_id', notification.segment);
        if (error) throw error;
        targetUsers = companies.map(c => c.user_id);
      }

      if (targetUsers.length === 0) {
        toast({ variant: 'default', title: 'No hay destinatarios', description: 'No se encontraron usuarios para este segmento.' });
        setLoading(false);
        return;
      }

      const notificationsToInsert = targetUsers.map(userId => ({
        ...notification,
        user_id: userId,
        description: notification.description,
      }));

      const { error: insertError } = await supabase.from('notifications').insert(notificationsToInsert);

      if (insertError) throw insertError;

      toast({
        title: 'Notificaciones Enviadas',
        description: `Se enviaron ${targetUsers.length} notificaciones.`,
      });
      setNotification({ title: '', description: '', notification_type: 'in-app', segment: 'all', link: '', status: 'sent' });
      fetchPastNotifications(); // Refresh history
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error al enviar', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Crear Notificación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input 
            placeholder="Título de la notificación" 
            value={notification.title}
            onChange={e => setNotification({...notification, title: e.target.value})}
          />
          <Textarea 
            placeholder="Escribe tu mensaje aquí..." 
            value={notification.description}
            onChange={e => setNotification({...notification, description: e.target.value})}
          />
          <Input 
            placeholder="Enlace (opcional, ej: /dashboard/settings)" 
            value={notification.link}
            onChange={e => setNotification({...notification, link: e.target.value})}
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <Select value={notification.notification_type} onValueChange={value => setNotification({...notification, notification_type: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in-app">In-App</SelectItem>
                <SelectItem value="email">Email (No implementado)</SelectItem>
              </SelectContent>
            </Select>
            <Select value={notification.segment} onValueChange={value => setNotification({...notification, segment: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Segmento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los usuarios</SelectItem>
                <SelectItem value="basico">Plan Básico</SelectItem>
                <SelectItem value="profesional">Plan Profesional</SelectItem>
                <SelectItem value="empresarial">Plan Empresarial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleSend} disabled={loading}>
            {loading ? <LoadingSpinner text="Enviando..." /> : 'Enviar Notificación'}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Historial de Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
            {loading ? <LoadingSpinner /> : (
              <ul className="space-y-3 max-h-96 overflow-y-auto">
                  {pastNotifications.map(notif => (
                      <li key={notif.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                              <p className="font-semibold">{notif.title}</p>
                              <p className="text-sm text-gray-500">Segmento: {notif.segment || 'N/A'} - {new Date(notif.created_at).toLocaleDateString('es-CL')}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {notif.notification_type === 'email' ? <Mail className="w-5 h-5 text-gray-400"/> : <Bell className="w-5 h-5 text-gray-400"/>}
                          </div>
                      </li>
                  ))}
              </ul>
            )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationManagement;