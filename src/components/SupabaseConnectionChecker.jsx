import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

const SupabaseConnectionChecker = ({ children }) => {
  const [status, setStatus] = useState('checking'); // checking, success, error
  const [error, setError] = useState(null);

  const checkConnection = useCallback(async () => {
    setStatus('checking');
    setError(null);

    // Check if the Supabase URL or Key are placeholders
    if (
      !supabase.supabaseUrl ||
      supabase.supabaseUrl.includes('__SUPABASE_URL__') ||
      !supabase.supabaseKey ||
      supabase.supabaseKey.includes('__SUPABASE_ANON_KEY__')
    ) {
      setError('Las credenciales de Supabase no han sido configuradas. Por favor, asegúrate de que la URL del proyecto y la clave anónima (anon key) estén correctamente establecidas en tu entorno.');
      setStatus('error');
      return;
    }

    try {
      // Use a simple, authentication-independent query to check connection
      const { error: queryError } = await supabase
        .from('plans')
        .select('id')
        .limit(1);

      if (queryError) {
        if (queryError.message.toLowerCase().includes('failed to fetch') || queryError.message.includes('NetworkError')) {
          throw new Error('Error de red. Verifica tu conexión a internet y que la URL de Supabase sea correcta y accesible.');
        }
        if (queryError.message.includes('JWT') || queryError.message.includes('API key') || queryError.message.includes('Invalid API key')) {
          throw new Error('Credenciales de Supabase inválidas. Por favor, verifica tu URL y tu Anon Key.');
        }
        throw new Error(queryError.message);
      }
      
      setStatus('success');
    } catch (err) {
      console.error("Supabase connection check failed:", err);
      setError(err.message || 'No se pudo conectar con la base de datos.');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  if (status === 'checking') {
    return <LoadingSpinner text="Verificando conexión con la base de datos..." />;
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg text-center bg-white p-8 rounded-2xl shadow-xl"
        >
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mt-6">Error de Conexión</h1>
          <p className="text-gray-600 mt-2 mb-6">
            No pudimos establecer una conexión segura con la base de datos. Esto puede deberse a credenciales incorrectas o problemas de red.
          </p>
          <div className="text-left bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
            <h2 className="font-semibold text-red-800 mb-2">Pasos para solucionarlo:</h2>
            <ol className="list-decimal list-inside text-sm text-red-700 space-y-1">
              <li>Ingresa a tu panel de control de <strong>Supabase</strong>.</li>
              <li>Navega a <strong>Project Settings &rarr; API</strong>.</li>
              <li>Confirma que la <strong>Project URL</strong> y la <strong>anon public key</strong> coincidan con las configuradas en tu entorno.</li>
            </ol>
             <p className="text-xs text-red-600 mt-3">
              <strong>Error detectado:</strong> {error}
            </p>
          </div>
          <Button onClick={checkConnection} size="lg">
            Reintentar Conexión
          </Button>
        </motion.div>
      </div>
    );
  }

  return children;
};

export default SupabaseConnectionChecker;