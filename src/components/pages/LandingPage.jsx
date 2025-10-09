import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  MessageSquare,
  ArrowRight,
  LogIn
} from 'lucide-react';

function LandingPage({ onGetStarted, onLogin }) {

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="absolute top-0 left-0 right-0 z-20 bg-white/30 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex justify-end items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLogin}
            className="btn-secondary flex items-center"
          >
            <LogIn className="mr-2 h-4 w-4" /> Iniciar Sesión
          </motion.button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-36 pb-20 md:pt-40">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-indigo-600/20"></div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.img 
              src="https://storage.googleapis.com/hostinger-horizons-assets-prod/1a278a57-ddc3-48d4-9216-30f7b1b4e998/216e817e9696a1575f704e812c10a089.png" 
              alt="Logo de Client Pulse: Medición de Satisfacción y Benchmarking" 
              className="mx-auto h-80 w-auto object-contain transition-all duration-300 mb-6"
              style={{ filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.3))' }}
            />
            <h1 className="text-5xl md:text-7xl font-bold gradient-text mb-6">
              Mide la Satisfacción de tus Clientes
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              Transforma la experiencia de tus clientes con encuestas inteligentes, 
              benchmarking sectorial y análisis en tiempo real
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onGetStarted}
                className="btn-primary text-lg px-8 py-4"
              >
                Comenzar Ahora <ArrowRight className="ml-2 w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold gradient-text mb-4">
              ¿Por qué elegir nuestra plataforma?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Herramientas avanzadas para entender y mejorar la experiencia de tus clientes
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <BarChart3 className="w-12 h-12 text-blue-600" />,
                title: 'Análisis Inteligente',
                description: 'Métricas avanzadas y visualizaciones que revelan insights accionables'
              },
              {
                icon: <TrendingUp className="w-12 h-12 text-purple-600" />,
                title: 'Benchmarking Sectorial',
                description: 'Compárate con empresas de tu rubro y descubre oportunidades de mejora'
              },
              {
                icon: <MessageSquare className="w-12 h-12 text-indigo-600" />,
                title: 'Encuestas Personalizadas',
                description: 'Crea encuestas específicas para productos, servicios o investigación de mercado'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="glass-effect p-8 rounded-2xl card-hover text-center"
              >
                <div className="mb-4 flex justify-center">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              ¿Listo para transformar tu negocio?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Únete a cientos de empresas que ya están mejorando su satisfacción de clientes
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGetStarted}
              className="bg-white text-blue-600 font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Ver Planes y Precios
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;