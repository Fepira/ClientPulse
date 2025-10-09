import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Send, Inbox, Mail, MailOpen } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const MessageThread = ({ threadId, onBack, currentUser }) => {
  const [threadMessages, setThreadMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState({ subject: '', body: '' });
  const [isReplying, setIsReplying] = useState(false);
  const { toast } = useToast();
  const [senderCompanyName, setSenderCompanyName] = useState('Usuario');

  const fetchThreadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender_id
        `)
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      setThreadMessages(data);
      
      if (data.length > 0) {
        setReply({ subject: `Re: ${data[0].subject}`, body: '' });
        
        const userMessage = data.find(m => m.sender_role === 'user');
        if (userMessage) {
          const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .select('company_name')
            .eq('user_id', userMessage.sender_id)
            .single();
          
          if (companyError) console.error("Error fetching company name:", companyError);
          else setSenderCompanyName(companyData.company_name);
        }
      }
    } catch (error) {
      console.error("Error fetching thread messages:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo cargar el hilo de mensajes.' });
    } finally {
      setLoading(false);
    }
  }, [threadId, toast]);

  useEffect(() => {
    fetchThreadMessages();
  }, [fetchThreadMessages]);

  const handleSendReply = async () => {
    if (!reply.subject || !reply.body) {
      toast({ variant: 'destructive', title: 'Error', description: 'Asunto y mensaje son requeridos.' });
      return;
    }
    setIsReplying(true);
    const originalMessage = threadMessages.find(m => m.sender_id !== currentUser.id);

    if (!originalMessage) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se puede encontrar el destinatario original.' });
        setIsReplying(false);
        return;
    }

    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: currentUser.id,
        recipient_id: originalMessage.sender_id,
        subject: reply.subject,
        body: reply.body,
        thread_id: threadId,
        sender_role: 'admin',
        recipient_role: 'user'
      });
      if (error) throw error;
      toast({ title: 'Respuesta Enviada' });
      setReply(prev => ({ ...prev, body: '' }));
      fetchThreadMessages();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error al enviar respuesta', description: error.message });
    } finally {
      setIsReplying(false);
    }
  };
  
  if (loading) return <LoadingSpinner text="Cargando conversación..." />;

  const originalMessage = threadMessages.length > 0 ? threadMessages[0] : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Buzón
          </Button>
          <span>{originalMessage?.subject || 'Conversación'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {threadMessages.map(msg => {
            const senderName = msg.sender_role === 'admin' ? "Administrador" : senderCompanyName;
            return (
                <div key={msg.id} className={`p-3 rounded-lg ${msg.sender_id === currentUser.id ? 'bg-blue-100 ml-auto' : 'bg-gray-100'} max-w-[80%]`}>
                  <p className="font-bold text-sm">{senderName}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(msg.created_at), 'dd MMM yyyy, HH:mm', { locale: es })}</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm">{msg.body}</p>
                </div>
            )
          })}
        </div>
        
        <div className="border-t pt-4 mt-6">
          <h4 className="font-semibold mb-2">Responder</h4>
          <div className="space-y-2">
            <Input 
              placeholder="Asunto" 
              value={reply.subject}
              onChange={(e) => setReply(prev => ({ ...prev, subject: e.target.value }))}
              disabled
            />
            <Textarea 
              placeholder="Escribe tu respuesta..." 
              rows={5}
              value={reply.body}
              onChange={(e) => setReply(prev => ({ ...prev, body: e.target.value }))}
            />
            <Button onClick={handleSendReply} disabled={isReplying}>
              {isReplying ? <LoadingSpinner text="Enviando..." /> : <><Send className="w-4 h-4 mr-2" /> Enviar Respuesta</>}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


const MessagesTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [threads, setThreads] = useState([]);
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMessageThreads = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_admin_message_threads');
      if (error) throw error;
      setThreads(data);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los hilos de mensajes.' });
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchMessageThreads();
    
    const channel = supabase
      .channel('messages-tab-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
          fetchMessageThreads();
      })
      .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };

  }, [fetchMessageThreads]);

  const handleSelectThread = async (thread) => {
    setSelectedThreadId(thread.thread_id);
    if (!thread.is_read) {
       await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('thread_id', thread.thread_id)
        .is('read_at', null)
        .eq('recipient_id', user.id);
      
      fetchMessageThreads();
    }
  };

  if (loading) return <LoadingSpinner text="Cargando buzón..." />;

  if (selectedThreadId) {
    return <MessageThread threadId={selectedThreadId} onBack={() => setSelectedThreadId(null)} currentUser={user} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Inbox /> Buzón de Entrada</CardTitle>
      </CardHeader>
      <CardContent>
        {threads.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No tienes mensajes.</p>
        ) : (
          <ul className="space-y-2">
            {threads.map(thread => (
              <li 
                key={thread.thread_id} 
                onClick={() => handleSelectThread(thread)}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  thread.is_read ? 'bg-gray-50 hover:bg-gray-100' : 'bg-blue-50 hover:bg-blue-100 font-semibold'
                }`}
              >
                <div className="flex items-center gap-3">
                  {thread.is_read ? <MailOpen className="w-5 h-5 text-gray-500" /> : <Mail className="w-5 h-5 text-blue-600" />}
                  <div>
                    <p>{thread.subject}</p>
                    <p className={`text-sm ${thread.is_read ? 'text-gray-500' : 'text-blue-700'}`}>
                      De: {thread.sender_name || 'Usuario desconocido'}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(thread.last_message_at), { addSuffix: true, locale: es })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default MessagesTab;