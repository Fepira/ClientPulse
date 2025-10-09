import React, { useState } from 'react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { useToast } from '@/components/ui/use-toast';
    import { Eye, EyeOff, Loader2 } from 'lucide-react';

    export default function AuthPage({ onBack, onLoginSuccess }) {
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [showPassword, setShowPassword] = useState(false);
      const [loading, setLoading] = useState(false);
      const [view, setView] = useState('login'); // 'login' or 'reset'
      const { signIn, sendPasswordResetEmail } = useAuth();
      const { toast } = useToast();

      const handleLogin = async (loginEmail, loginPassword) => {
        setLoading(true);
        const { data, error } = await signIn(loginEmail, loginPassword);
        setLoading(false);

        if (error) {
           toast({
            title: "Error de inicio de sesión",
            description: error.message === 'Invalid login credentials' 
              ? 'Las credenciales son incorrectas. Por favor, verifica tu email y contraseña.'
              : 'Hubo un problema al iniciar sesión. Inténtalo de nuevo.',
            variant: "destructive",
          });
        } else {
          toast({
            title: "¡Bienvenido de vuelta!",
            description: "Has iniciado sesión correctamente. Redirigiendo...",
          });
          if(onLoginSuccess && data.user) {
              onLoginSuccess(data.user);
          }
        }
      };

      const handlePasswordReset = async (resetEmail) => {
        setLoading(true);
        await sendPasswordResetEmail(resetEmail);
        setLoading(false);
        setView('login');
      };

      const handleSubmit = (e) => {
        e.preventDefault();
        if (view === 'login') {
          handleLogin(email, password);
        } else {
          handlePasswordReset(email);
        }
      };

      return (
        <div className="min-h-screen py-20 flex items-center justify-center">
          <div className="container mx-auto px-6 max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="text-center mb-12 flex flex-col items-center">
                <img 
                  src="https://horizons-cdn.hostinger.com/1a278a57-ddc3-48d4-9216-30f7b1b4e998/7aa21c64fa4b18ce9580c21f04d166b1.png" 
                  alt="Logo de Client Pulse: Medición de Satisfacción y Benchmarking" 
                  className="h-32 w-auto mb-6 object-contain"
                />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={view}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {view === 'login' ? (
                      <>
                        <h1 className="text-4xl font-bold gradient-text mb-4">
                          Iniciar Sesión
                        </h1>
                        <p className="text-gray-600">Accede a tu cuenta para continuar.</p>
                      </>
                    ) : (
                      <>
                        <h1 className="text-4xl font-bold gradient-text mb-4">
                          Recuperar Contraseña
                        </h1>
                        <p className="text-gray-600">Ingresa tu email para recibir un enlace de recuperación.</p>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <form onSubmit={handleSubmit} className="glass-effect p-8 rounded-2xl space-y-6">
                <AnimatePresence mode="wait">
                  {view === 'login' ? (
                    <motion.div
                      key="login-form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="input-field"
                          placeholder="tu@email.com"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Contraseña
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field pr-12"
                            placeholder="••••••••"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        <div className="text-right mt-2">
                          <button
                            type="button"
                            onClick={() => setView('reset')}
                            className="text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors"
                          >
                            ¿Olvidaste tu contraseña?
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="reset-form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="input-field"
                          placeholder="tu@email.com"
                          required
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-4 pt-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onBack}
                    disabled={loading}
                    className="btn-secondary flex-1 disabled:opacity-50"
                  >
                    Volver
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    className="btn-primary flex-1 disabled:opacity-50 flex items-center justify-center"
                  >
                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (view === 'login' ? 'Iniciar Sesión' : 'Enviar Enlace')}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      );
    }