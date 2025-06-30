'use client';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../firebase';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { conquistas } from '@/utils/conquistas';
import { Pie } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import {
  FiTarget,
  FiCpu,
  FiDollarSign,
  FiZap,
  FiTrendingDown,
  FiLayers,
  FiCalendar,
  FiAward,
  FiCheckCircle,
  FiLock,
  FiStar,
  FiTrendingUp
} from 'react-icons/fi';
import Header from '@/components/Header';

Chart.register(ArcElement, Tooltip, Legend);
const db = getFirestore();

export default function PerfilPage() {
  const [user, setUser] = useState<any>(null);
  const [dados, setDados] = useState<any>({});
  const [desbloqueadas, setDesbloqueadas] = useState<string[]>([]);
  const router = useRouter();

  // Retorna o ícone com base no tipo
  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'metas': return <FiTarget className="text-xl" />;
      case 'eletronicos': return <FiCpu className="text-xl" />;
      case 'tarifas': return <FiDollarSign className="text-xl" />;
      case 'consumo': return <FiZap className="text-xl" />;
      case 'economia': return <FiTrendingDown className="text-xl" />;
      case 'combo': return <FiLayers className="text-xl" />;
      case 'semanal': return <FiCalendar className="text-xl" />;
      case 'locais': return <FiLayers className="text-xl" />;
      case 'comodos': return <FiCpu className="text-xl" />;
      case 'geral': return <FiAward className="text-xl" />;
      default: return <FiAward className="text-xl" />;
    }
  };

  // Retorna a cor baseada na dificuldade
  const getDifficultyColor = (dificuldade: string) => {
    switch (dificuldade) {
      case 'fácil': return 'from-green-500 to-emerald-500';
      case 'médio': return 'from-yellow-500 to-orange-500';
      case 'difícil': return 'from-red-500 to-pink-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  // Filtra as conquistas para progressão
  const conquistasFiltradas = conquistas.filter(c => {
    if(c.prev) {
      return desbloqueadas.includes(c.prev);
    }
    return true;
  });

  // Função que verifica as conquistas a partir dos dados do usuário
  const verificarConquistas = (data: any) => {
    const locations = data.locations || [];
    const totalLocations = locations.length;
    const totalEletronicos = locations.reduce(
      (acc: number, loc: any) => acc + (loc.devices ? loc.devices.length : 0),
      0
    );
    const totalTarifas = locations.reduce(
      (acc: number, loc: any) => acc + (loc.tariffs ? Object.keys(loc.tariffs).length : 0),
      0
    );
    const totalRooms = locations.reduce(
      (acc: number, loc: any) => acc + (loc.rooms ? loc.rooms.length : 0),
      0
    );

    return conquistas
      .filter(c => {
        switch (c.tipo) {
          case 'metas':
            return (data.historicoConcluidas || 0) >= parseInt(c.condicao);
          case 'eletronicos':
            return totalEletronicos >= parseInt(c.condicao);
          case 'tarifas':
            return totalTarifas >= parseInt(c.condicao);
          case 'economia':
            return (data.economiaTotalReais || 0) >= parseFloat(c.condicao);
          case 'consumo':
            return (data.economiaTotalKwh || 0) >= parseFloat(c.condicao);
          case 'combo':
            return !!(totalEletronicos && totalTarifas && data.metas);
          case 'semanal':
            return false;
          case 'locais':
            return totalLocations >= parseInt(c.condicao);
          case 'comodos':
            return totalRooms >= parseInt(c.condicao);
          case 'geral':
            return true;
          default:
            return false;
        }
      })
      .map(c => c.id);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!u) return router.push('/login');
      setUser(u);

      const ref = doc(db, 'usuarios', u.uid);
      const snap = await getDoc(ref);
      const data = snap.exists() ? snap.data() : {};
      setDados(data);

      const salvas = data.conquistasDesbloqueadas || [];
      const calculadas = verificarConquistas(data);
      const novas = calculadas.filter((id: string) => !salvas.includes(id));

      if (novas.length > 0) {
        await setDoc(ref, {
          conquistasDesbloqueadas: [...salvas, ...novas]
        }, { merge: true });
      }

      setDesbloqueadas([...salvas, ...novas]);
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen pt-[80px] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 space-y-8">
      <Header nome={user?.displayName || user?.email || ''} />
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">
            Minhas Conquistas
          </h1>
          <p className="text-slate-400 text-lg">Acompanhe seu progresso e desbloqueie conquistas</p>
        </motion.div>

        {/* Estatísticas das Conquistas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <FiCheckCircle className="text-green-400 text-2xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{desbloqueadas.length}</p>
                <p className="text-slate-400 text-sm">Desbloqueadas</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <FiLock className="text-blue-400 text-2xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{conquistas.length - desbloqueadas.length}</p>
                <p className="text-slate-400 text-sm">Pendentes</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <FiTrendingUp className="text-purple-400 text-2xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {Math.round((desbloqueadas.length / conquistas.length) * 100)}%
                </p>
                <p className="text-slate-400 text-sm">Progresso</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-500/20 rounded-xl">
                <FiStar className="text-yellow-400 text-2xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{conquistas.length}</p>
                <p className="text-slate-400 text-sm">Total</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Gráfico de Progresso */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-500/20 rounded-xl">
              <FiTrendingUp className="text-orange-400 text-xl" />
            </div>
            <h2 className="text-2xl font-semibold text-white">Progresso Geral</h2>
          </div>
          
          <div className="max-w-lg mx-auto">
            <div className="h-80">
              <Pie
                data={{
                  labels: ['Desbloqueadas', 'Pendentes'],
                  datasets: [{
                    data: [desbloqueadas.length, conquistas.length - desbloqueadas.length],
                    backgroundColor: [
                      'rgba(34, 197, 94, 0.8)',
                      'rgba(59, 130, 246, 0.8)'
                    ],
                    borderColor: [
                      'rgb(34, 197, 94)',
                      'rgb(59, 130, 246)'
                    ],
                    borderWidth: 2
                  }]
                }}
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      labels: { 
                        color: 'white',
                        font: { size: 14 }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Lista de Conquistas */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-500/20 rounded-xl">
              <FiAward className="text-yellow-400 text-xl" />
            </div>
            <h2 className="text-2xl font-semibold text-white">Todas as Conquistas</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {conquistasFiltradas.map(c => {
              const ativo = desbloqueadas.includes(c.id);
              const difficultyGradient = getDifficultyColor(c.dificuldade);

              return (
                <motion.div
                  key={`${c.id}-${Math.random().toString(36).substr(2,5)}`}
                  whileHover={{ scale: ativo ? 1.05 : 1.02 }}
                  className={`relative overflow-hidden rounded-2xl transition-all duration-300 ${
                    ativo
                      ? 'bg-white/10 backdrop-blur-sm border border-green-500/30 shadow-lg shadow-green-500/20'
                      : 'bg-white/5 backdrop-blur-sm border border-white/10 opacity-60 grayscale'
                  }`}
                >
                  {/* Indicador de status */}
                  <div className={`absolute top-4 right-4 p-2 rounded-full ${
                    ativo ? 'bg-green-500/20' : 'bg-gray-500/20'
                  }`}>
                    {ativo ? (
                      <FiCheckCircle className="text-green-400" />
                    ) : (
                      <FiLock className="text-gray-400" />
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-3 rounded-xl ${
                        ativo ? 'bg-green-500/20' : 'bg-gray-500/20'
                      }`}>
                        {getIcon(c.tipo)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1">{c.titulo}</h3>
                        {c.dificuldade && (
                          <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${difficultyGradient} text-white`}>
                            {c.dificuldade}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                      {c.descricao}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">
                        Tipo: <span className="text-white font-medium">{c.tipo}</span>
                      </span>
                      <span className="text-slate-400">
                        Meta: <span className="text-white font-medium">{c.condicao}</span>
                      </span>
                    </div>
                  </div>

                  {/* Efeito de brilho para conquistas desbloqueadas */}
                  {ativo && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 animate-pulse"></div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}