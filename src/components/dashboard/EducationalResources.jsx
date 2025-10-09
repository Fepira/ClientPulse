import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { BookOpen, Search, Video, FileText, BarChart2, Star } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const typeIcons = {
  'Artículo': <FileText className="w-6 h-6 text-blue-500" />,
  'Guía': <FileText className="w-6 h-6 text-green-500" />,
  'Video': <Video className="w-6 h-6 text-red-500" />,
  'Benchmarking': <BarChart2 className="w-6 h-6 text-purple-500" />,
  'Caso de Éxito': <Star className="w-6 h-6 text-yellow-500" />,
  'default': <BookOpen className="w-6 h-6 text-gray-500" />,
};

const EducationalResources = () => {
  const [allResources, setAllResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('Todos');
  const { toast } = useToast();

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('title', { ascending: true });

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Error al cargar recursos',
          description: error.message,
        });
      } else {
        setAllResources(data);
      }
      setLoading(false);
    };

    fetchResources();
  }, [toast]);

  const filteredResources = allResources
    .filter(r => filter === 'Todos' || r.type === filter)
    .filter(r => r.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const filters = ['Todos', ...new Set(allResources.map(r => r.type).filter(Boolean))];

  const handleResourceClick = (resource) => {
    if (resource.file_url) {
        window.open(resource.file_url, '_blank', 'noopener,noreferrer');
    } else {
        toast({ title: "🚧 Próximamente", description: "Este recurso aún no tiene un archivo adjunto." });
    }
  };

  if (loading) {
    return <div className="p-8 bg-white rounded-2xl shadow-lg"><LoadingSpinner text="Cargando recursos..." /></div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 bg-white rounded-2xl shadow-lg"
    >
      <h3 className="text-2xl font-bold flex items-center space-x-3 mb-6">
        <BookOpen className="w-8 h-8 text-green-500" />
        <span>Recursos Educativos</span>
      </h3>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar recursos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${
                filter === f ? 'bg-purple-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource, index) => (
          <motion.div
            key={resource.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleResourceClick(resource)}
            className="bg-gray-50 p-4 rounded-xl hover:shadow-md hover:bg-white border border-transparent hover:border-purple-200 transition-all cursor-pointer flex items-start space-x-4"
          >
            <div className="flex-shrink-0">{typeIcons[resource.type] || typeIcons.default}</div>
            <div>
              <p className="font-semibold text-gray-800">{resource.title}</p>
              <span className="text-xs font-semibold uppercase text-gray-500">{resource.type}</span>
            </div>
          </motion.div>
        ))}
      </div>
      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No se encontraron recursos que coincidan con tu búsqueda.</p>
        </div>
      )}
    </motion.div>
  );
};

export default EducationalResources;