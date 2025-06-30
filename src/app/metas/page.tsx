'use client';
import { useEffect, useState } from 'react';
import { auth } from '../../../firebase';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, getFirestore } from 'firebase/firestore';
import { bancoDeMetas } from '../../utils/bancometas';
import { sortearNovaMeta, podeTrocarMeta } from '../../utils/metaHelpers';
import { Meta, Usadas, UsuarioData } from '../../../types/meta';
import { motion } from 'framer-motion';
import { FiTarget, FiCheckCircle, FiCalendar, FiTrendingUp, FiClock, FiAward } from 'react-icons/fi';
import Header from '@/components/Header';
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

Chart.register(ArcElement, Tooltip, Legend);

const db = getFirestore();

export default function MetasPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [semanais, setSemanais] = useState<Meta[]>([]);
  const [mensais, setMensais] = useState<Meta[]>([]);
  const [usadas, setUsadas] = useState<Usadas>({ semanais: [], mensais: [] });
  const [totalConcluidas, setTotalConcluidas] = useState(0);
  const router = useRouter();

  const concluirMeta = async (tipo: 'semanais' | 'mensais', id: string) => {
    const metas = tipo === 'semanais' ? [...semanais] : [...mensais];
    const atualizadas = metas.map(m =>
      m.id === id ? { ...m, concluida: true, progresso: 100 } : m
    );

    const metaConcluida = atualizadas.find(m => m.id === id);
    let novasMetas = [...atualizadas];
    let novasUsadas = [...usadas[tipo]];

    if (metaConcluida && podeTrocarMeta(metaConcluida, tipo)) {
      novasUsadas.push(id);
      const novaMeta = sortearNovaMeta(tipo, novasUsadas);
      novasMetas = [
        ...atualizadas.filter(m => m.id !== id),
        { ...novaMeta, concluida: false, progresso: 0, geradaEm: new Date() }
      ];
    }

    if (tipo === 'semanais') setSemanais(novasMetas);
    else setMensais(novasMetas);

    const updatedUsadas = { ...usadas, [tipo]: novasUsadas };
    setUsadas(updatedUsadas);
    const novoTotal = totalConcluidas + 1;
    setTotalConcluidas(novoTotal);

    await setDoc(doc(db, 'usuarios', user.uid), {
      metas: {
        semanais: tipo === 'semanais' ? novasMetas : semanais,
        mensais: tipo === 'mensais' ? novasMetas : mensais
      },
      metasUsadas: updatedUsadas,
      historicoConcluidas: novoTotal
    }, { merge: true });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!u) return router.push('/login');
      setUser(u);
      const ref = doc(db, 'usuarios', u.uid);
      const snap = await getDoc(ref);
      const data = snap.exists() ? snap.data() as UsuarioData : {
        metas: { semanais: [], mensais: [] },
        metasUsadas: { semanais: [], mensais: [] },
        historicoConcluidas: 0
      };

      let { semanais, mensais } = data.metas || {};
      const usadas = data.metasUsadas || { semanais: [], mensais: [] };

      if (!semanais?.length || !mensais?.length) {
        const novasSemanais = Array.from({ length: 3 }, () => sortearNovaMeta('semanais', usadas.semanais));
        const novasMensais = Array.from({ length: 3 }, () => sortearNovaMeta('mensais', usadas.mensais));
        semanais = novasSemanais.map(m => ({ ...m, progresso: 0, concluida: false, geradaEm: new Date() }));
        mensais = novasMensais.map(m => ({ ...m, progresso: 0, concluida: false, geradaEm: new Date() }));

        await setDoc(ref, {
          metas: { semanais, mensais },
          metasUsadas: {
            semanais: semanais.map(m => m.id),
            mensais: mensais.map(m => m.id)
          },
          historicoConcluidas: 0
        }, { merge: true });
      }

      setSemanais(semanais);
      setMensais(mensais);
      setUsadas(usadas);
      setTotalConcluidas(data.historicoConcluidas || 0);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) 
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando metas...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen pt-[80px] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 space-y-8">
      <Header nome={user?.displayName || user?.email} />
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Minhas Metas
          </h1>
          <p className="text-slate-400 text-lg">Alcance seus objetivos de economia de energia</p>
        </motion.div>

        {/* Estatísticas das Metas */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-green-500/30 p-8 rounded-3xl shadow-2xl mb-8"
        >
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <FiAward className="text-green-400 text-2xl" />
              </div>
              <h2 className="text-2xl font-semibold text-white">Progresso Total</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  {totalConcluidas}
                </p>
                <p className="text-slate-400">Metas Concluídas</p>
              </div>
              <div>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {[...semanais, ...mensais].filter(m => !m.concluida).length}
                </p>
                <p className="text-slate-400">Metas Ativas</p>
              </div>
              <div>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {Math.round((totalConcluidas / (totalConcluidas + [...semanais, ...mensais].filter(m => !m.concluida).length)) * 100) || 0}%
                </p>
                <p className="text-slate-400">Taxa de Sucesso</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Metas Semanais e Mensais */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {[
            { 
              titulo: 'Metas Semanais', 
              metas: semanais, 
              tipo: 'semanais' as const,
              icon: <FiClock className="text-orange-400 text-xl" />,
              gradient: "from-orange-500/20 to-red-500/20",
              border: "border-orange-500/30"
            }, 
            { 
              titulo: 'Metas Mensais', 
              metas: mensais, 
              tipo: 'mensais' as const,
              icon: <FiCalendar className="text-blue-400 text-xl" />,
              gradient: "from-blue-500/20 to-purple-500/20",
              border: "border-blue-500/30"
            }
          ].map(({ titulo, metas, tipo, icon, gradient, border }) => (
            <motion.div
              key={tipo}
              initial={{ opacity: 0, x: tipo === 'semanais' ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              className={`bg-gradient-to-br ${gradient} backdrop-blur-xl border ${border} p-6 rounded-3xl shadow-2xl`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-white/10 rounded-xl">
                  {icon}
                </div>
                <h2 className="text-2xl font-semibold text-white">{titulo}</h2>
              </div>
              
              <div className="space-y-4">
                {metas.map((meta, index) => (
                  <div key={`${meta.id}-${index}`} className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/10 hover:bg-white/15 transition-all duration-300">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                      <div className="flex-1">
                        <p className={`font-semibold text-lg mb-2 ${meta.concluida ? 'line-through text-slate-400' : 'text-white'}`}>
                          {meta.titulo}
                        </p>
                        <div className="w-full bg-white/20 rounded-full h-3 mb-2">
                          <div 
                            className="bg-gradient-to-r from-green-400 to-emerald-400 h-3 rounded-full transition-all duration-500" 
                            style={{ width: `${meta.progresso}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-slate-300">{meta.progresso}% concluído</p>
                      </div>
                      
                      <button
                        onClick={() => concluirMeta(tipo, meta.id)}
                        disabled={meta.concluida}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                          meta.concluida
                            ? 'bg-green-500/30 text-green-300 cursor-default'
                            : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-green-500/25 hover:scale-105'
                        }`}
                      >
                        {meta.concluida ? (
                          <>
                            <FiCheckCircle />
                            Concluída
                          </>
                        ) : (
                          <>
                            <FiTarget />
                            Concluir
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Resumo Geral */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/20 rounded-xl">
              <FiTrendingUp className="text-purple-400 text-xl" />
            </div>
            <h2 className="text-2xl font-semibold text-white">Análise de Progresso</h2>
          </div>
          
          <div className="max-w-lg mx-auto">
            <div className="h-80">
              <Pie
                data={{
                  labels: ['Concluídas', 'Pendentes'],
                  datasets: [
                    {
                      label: 'Metas',
                      data: [
                        [...semanais, ...mensais].filter(m => m.concluida).length,
                        [...semanais, ...mensais].filter(m => !m.concluida).length
                      ],
                      backgroundColor: [
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(59, 130, 246, 0.8)'
                      ],
                      borderColor: [
                        'rgb(34, 197, 94)',
                        'rgb(59, 130, 246)'
                      ],
                      borderWidth: 2
                    }
                  ]
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
      </div>
    </div>
  );
}