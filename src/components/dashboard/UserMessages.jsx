import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Send, Inbox, Mail, MailOpen, PlusCircle } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const MessageThread = ({ threadId, onBack, currentUser }) => {
  const [threadMessages, setThreadMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState({ subject: '', body: '' });
  const [isReplying, setIsReplying] = useState(false);
  const { toast } = useToast();

  const fetchThreadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`*, sender:user_profiles!messages_sender_id_fkey(full_name)`)
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setThreadMessages(data);
      if (data.length > 0) {
        setReply({ subject: `Re: ${data[0].subject}`, body: '' });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo cargar el hilo de mensajes.' });
    } finally {
      setLoading(false);
    }
  }, [threadId, toast]);

  useEffect(() => {
    fetchThreadMessages();
  }, [fetchThreadMessages]);

  const handleSendReply = async () => {
    if (!reply.body) {
      toast({ variant: 'destructive', title: 'Error', description: 'El mensaje no puede estar vacío.' });
      return;
    }
    setIsReplying(true);
    const adminMessage = threadMessages.find(m => m.sender_role === 'admin');
    if (!adminMessage) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo encontrar al destinatario.' });
        setIsReplying(false);
        return;
    }

    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: currentUser.id,
        recipient_id: adminMessage.sender_id,
        subject: reply.subject,
        body: reply.body,
        thread_id: threadId,
        sender_role: 'user',
        recipient_role: 'admin'
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
          {threadMessages.map(msg => (
            <div key={msg.id} className={`p-3 rounded-lg ${msg.sender_id === currentUser.id ? 'bg-blue-100 ml-auto' : 'bg-gray-100'} max-w-[80%]`}>
              <p className="font-bold text-sm">{msg.sender_role === 'admin' ? 'Soporte' : 'Tú'}</p>
              <p className="text-xs text-muted-foreground">{format(new Date(msg.created_at), 'dd MMM yyyy, HH:mm', { locale: es })}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm">{msg.body}</p>
            </div>
          ))}
        </div>
        
        <div className="border-t pt-4 mt-6">
          <h4 className="font-semibold mb-2">Responder</h4>
          <div className="space-y-2">
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

const UserMessages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [threads, setThreads] = useState([]);
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [newMessage, setNewMessage] = useState({ subject: '', body: '' });
  const [isSending, setIsSending] = useState(false);

  const fetchMessageThreads = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_user_message_threads');
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
      .channel('user-messages-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `recipient_id=eq.${user.id}` }, (payload) => {
          fetchMessageThreads();
      })
      .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
  }, [fetchMessageThreads, user.id]);

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

  const handleSendNewMessage = async () => {
    if (!newMessage.subject || !newMessage.body) {
      toast({ variant: 'destructive', title: 'Error', description: 'Asunto y mensaje son requeridos.' });
      return;
    }
    setIsSending(true);
    try {
      const { error } = await supabase.rpc('send_message_to_admin', {
        p_subject: newMessage.subject,
        p_body: newMessage.body,
      });

      if (error) throw error;

      toast({ title: 'Mensaje Enviado', description: 'Tu mensaje ha sido enviado al administrador.' });
      setIsNewMessageOpen(false);
      setNewMessage({ subject: '', body: '' });
      fetchMessageThreads();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error al enviar mensaje', description: error.message });
    } finally {
      setIsSending(false);
    }
  };

  if (loading) return <LoadingSpinner text="Cargando buzón..." />;

  if (selectedThreadId) {
    return <MessageThread threadId={selectedThreadId} onBack={() => setSelectedThreadId(null)} currentUser={user} />;
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Inbox /> Buzón de Entrada</CardTitle>
          <Button onClick={() => setIsNewMessageOpen(true)}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Nuevo Mensaje
          </Button>
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
                        Último mensaje de: {thread.last_sender_role === 'admin' ? 'Soporte' : 'Tú'}
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

      <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Nuevo Mensaje a Soporte</DialogTitle>
            <DialogDescription>
              Describe tu consulta y un administrador te responderá a la brevedad.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input 
              placeholder="Asunto"
              value={newMessage.subject}
              onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
            />
            <Textarea 
              placeholder="Escribe tu mensaje aquí..."
              value={newMessage.body}
              onChange={(e) => setNewMessage(prev => ({ ...prev, body: e.target.value }))}
              rows={6}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewMessageOpen(false)}>Cancelar</Button>
            <Button onClick={handleSendNewMessage} disabled={isSending}>
              {isSending ? 'Enviando...' : 'Enviar Mensaje'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserMessages;