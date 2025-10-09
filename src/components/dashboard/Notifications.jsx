import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Bell, Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel(`notifications:${user.id}`);
    const subscription = channel
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          toast({
            title: "🔔 Nueva Notificación",
            description: payload.new.title,
          });
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast, fetchNotifications]);

  const handleOpenChange = async (open) => {
    setIsOpen(open);
    if (open && unreadCount > 0) {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      if (unreadIds.length > 0) {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .in('id', unreadIds);
        
        if (!error) {
          setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
          setUnreadCount(0);
        }
      }
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification.link) {
      navigate(notification.link);
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors relative"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </motion.button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 font-semibold border-b">Notificaciones</div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map(notification => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 border-b last:border-b-0 hover:bg-gray-50 ${notification.link ? 'cursor-pointer' : ''}`}
              >
                <div className="flex items-start gap-3">
                  {!notification.is_read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>}
                  <div className={`flex-grow ${notification.is_read ? 'ml-5' : ''}`}>
                    <p className="font-semibold text-sm">{notification.title}</p>
                    <p className="text-xs text-gray-600">{notification.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: es })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-sm text-gray-500">
              <Info className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              No tienes notificaciones nuevas.
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default Notifications;