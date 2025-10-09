import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useToast } from '@/components/ui/use-toast';

    const AuthContext = createContext(undefined);

    export const AuthProvider = ({ children }) => {
      const { toast } = useToast();
      const [user, setUser] = useState(null);
      const [session, setSession] = useState(null);
      const [loading, setLoading] = useState(true);
      
      const signOut = useCallback(async () => {
        const { error } = await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        if (error) {
          toast({
            variant: "destructive",
            title: "Sign out Failed",
            description: error.message || "Something went wrong",
          });
        }
        window.location.hash = '/';
        return { error };
      }, [toast]);

      const handleSession = useCallback(async (currentSession) => {
        if (!currentSession) {
            setUser(null);
            setSession(null);
        } else {
            setSession(currentSession);
            setUser(currentSession.user);
        }
        setLoading(false);
      }, []);

      useEffect(() => {
        const getSession = async () => {
          try {
            const { data: { session: initialSession }, error } = await supabase.auth.getSession();
            if (error) throw error;
            handleSession(initialSession);
          } catch (error) {
             if(error.message.toLowerCase().includes('failed to fetch')) {
                toast({
                    variant: "destructive",
                    title: "Error de Conexión",
                    description: "No se pudo conectar a los servicios. Revisa tu conexión a internet."
                });
                setLoading(false);
             }
          }


          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, currentSession) => {
              if (event === 'TOKEN_REFRESHED' && !currentSession) {
                await signOut();
              } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setSession(null);
              }
               else {
                handleSession(currentSession);
              }
            }
          );
      
          return () => {
            subscription.unsubscribe();
          };
        };

        getSession();
      }, [handleSession, signOut, toast]);

      const apiWrapper = useCallback(async (apiCall) => {
        try {
          const { data, error } = await apiCall();
          if (error) {
            if (error.message.includes('Invalid Refresh Token') || error.message.includes('refresh_token_not_found') || error.status === 401 || error.message.toLowerCase().includes('failed to fetch')) {
              toast({
                variant: "destructive",
                title: "Sesión Expirada o Problema de Red",
                description: "Tu sesión ha expirado o no se puede conectar. Por favor, inicia sesión de nuevo.",
              });
              await signOut();
              return { data: null, error };
            }
             throw error;
          }
          return { data, error };
        } catch (error) {
            if (!error.message.includes('Invalid Refresh Token')) {
                 toast({
                    variant: "destructive",
                    title: "Error Inesperado",
                    description: error.message || "Ocurrió un error.",
                });
            }
            return { data: null, error };
        }
      }, [signOut, toast]);

      const signUp = useCallback(async (email, password, metadata) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: metadata,
          },
        });
    
        if (error) {
          toast({
            variant: "destructive",
            title: "Sign up Failed",
            description: error.message || "Something went wrong",
          });
        }
    
        return { data, error };
      }, [toast]);
    
      const signIn = useCallback(async (email, password) => {
        return await apiWrapper(() => supabase.auth.signInWithPassword({ email, password }));
      }, [apiWrapper]);

      
      const sendPasswordResetEmail = useCallback(async (email) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/#/update-password`,
        });
        if (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: error.message,
          });
        } else {
          toast({
            title: "Correo enviado",
            description: "Si existe una cuenta con ese email, recibirás un enlace para recuperar tu contraseña.",
          });
        }
      }, [toast]);

      const value = useMemo(() => ({
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        sendPasswordResetEmail,
      }), [user, session, loading, signUp, signIn, signOut, sendPasswordResetEmail]);

      return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
    };

    export const useAuth = () => {
      const context = useContext(AuthContext);
      if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
      }
      return context;
    };