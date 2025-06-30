'use client';
import { useState, useEffect } from 'react';
import { auth } from '../../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import Header from '@/components/Header';
import { Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { FiDollarSign, FiZap, FiTrendingDown, FiCalendar, FiTrash2, FiPlus } from 'react-icons/fi';
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';

Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const db = getFirestore();

export default function ContasPage() {
  const [user, setUser] = useState<any>(null);
  const [mes, setMes] = useState('2025-03');
  const [valor, setValor] = useState('');
  const [kwh, setKwh] = useState('');
  const [contas, setContas] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return router.push('/login');
      setUser(u);
      const ref = doc(db, 'usuarios', u.uid);
      const snap = await getDoc(ref);
      const data = snap.exists() ? snap.data() : {};
      setContas(data.contasDeLuz || []);
    });
    return () => unsub();
  }, [router]);

  const adicionarConta = async () => {
    if (!mes || !valor || !kwh || !user) return;
    const nova = { mes, valor: parseFloat(valor), consumo: parseFloat(kwh) };
    const novaLista = [...contas.filter(c => c.mes !== mes), nova];
    setContas(novaLista);
    
    await setDoc(doc(db, 'usuarios', user.uid), {
      contasDeLuz: novaLista
    }, { merge: true });

    // Calcular economia
    const ordenadas = [...novaLista].sort((a, b) => new Date(a.mes).getTime() - new Date(b.mes).getTime());
    const primeira = ordenadas[0];
    const ultima = ordenadas[ordenadas.length - 1];
    
    const economiaReais = primeira.valor - ultima.valor;
    const economiaKwh = primeira.consumo - ultima.consumo;
    
    // Salvar economia
    await setDoc(doc(db, 'usuarios', user.uid), {
      economiaTotalReais: economiaReais > 0 ? economiaReais : 0,
      economiaTotalKwh: economiaKwh > 0 ? economiaKwh : 0
    }, { merge: true });
    
    setValor('');
    setKwh('');
  };

  const removerConta = async (mesRemover: string) => {
    const novaLista = contas.filter(c => c.mes !== mesRemover);
    setContas(novaLista);
    await setDoc(doc(db, 'usuarios', user.uid), {
      contasDeLuz: novaLista
    }, { merge: true });
  };

  const economiaCalculada = () => {
    if (contas.length < 2) return { economiaReais: 0, economiaKwh: 0 };
    const ordenadas = [...contas].sort((a, b) => new Date(a.mes).getTime() - new Date(b.mes).getTime());
    const primeira = ordenadas[0];
    const ultima = ordenadas[ordenadas.length - 1];
    return {
      economiaReais: Math.max(primeira.valor - ultima.valor, 0),
      economiaKwh: Math.max(primeira.consumo - ultima.consumo, 0)
    };
  };
  
  const { economiaReais, economiaKwh } = economiaCalculada();
  
  const meses = contas.map(c => c.mes);
  const consumos = contas.map(c => c.consumo);
  const valores = contas.map(c => c.valor);

  return (
    <div className="min-h-screen pt-[80px] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 space-y-8">
      <Header nome={user?.displayName || user?.email || ''} />
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
            Registro de Contas
          </h1>
          <p className="text-slate-400 text-lg">Monitore seu consumo e economia de energia</p>
        </motion.div>

        {/* Economia Total */}
        {contas.length >= 2 && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-green-500/30 p-8 rounded-3xl shadow-2xl mb-8"
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <FiTrendingDown className="text-green-400 text-2xl" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Economia Total</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    R$ {economiaReais.toFixed(2)}
                  </p>
                  <p className="text-slate-400">Economia em Reais</p>
                </div>
                <div>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    {economiaKwh.toFixed(1)} kWh
                  </p>
                  <p className="text-slate-400">Economia em Energia</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Adicionar Nova Conta */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/20 rounded-xl">
              <FiPlus className="text-blue-400 text-xl" />
            </div>
            <h2 className="text-2xl font-semibold text-white">Adicionar Nova Conta</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-slate-400 mb-2">Mês/Ano</label>
              <div className="relative">
                <FiCalendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input 
                  type="month" 
                  value={mes} 
                  onChange={e => setMes(e.target.value)}
                  className="w-full pl-12 p-4 rounded-2xl bg-white/10 backdrop-blur-sm text-white border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-slate-400 mb-2">Consumo (kWh)</label>
              <div className="relative">
                <FiZap className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input 
                  type="number" 
                  placeholder="Ex: 150"
                  value={kwh} 
                  onChange={e => setKwh(e.target.value)}
                  className="w-full pl-12 p-4 rounded-2xl bg-white/10 backdrop-blur-sm text-white border border-white/20 placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-slate-400 mb-2">Valor Total (R$)</label>
              <div className="relative">
                <FiDollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input 
                  type="number" 
                  placeholder="Ex: 250.00"
                  value={valor} 
                  onChange={e => setValor(e.target.value)}
                  className="w-full pl-12 p-4 rounded-2xl bg-white/10 backdrop-blur-sm text-white border border-white/20 placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all"
                />
              </div>
            </div>
          </div>
          
          <button 
            onClick={adicionarConta}
            className="w-full px-6 py-4 mt-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
          >
            <FiPlus /> Salvar Conta
          </button>
        </motion.div>

        {/* Lista de Contas */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-500/20 rounded-xl">
              <FiDollarSign className="text-green-400 text-xl" />
            </div>
            <h2 className="text-2xl font-semibold text-white">Contas Registradas</h2>
          </div>
          
          {contas.length === 0 ? (
            <div className="text-center py-12">
              <FiCalendar className="mx-auto text-6xl text-slate-600 mb-4" />
              <p className="text-slate-400 text-lg">Nenhuma conta registrada ainda</p>
              <p className="text-slate-500">Adicione sua primeira conta para começar o monitoramento</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contas
                .sort((a, b) => new Date(b.mes).getTime() - new Date(a.mes).getTime())
                .map((c, i) => (
                <div key={i} className="flex items-center justify-between bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:bg-white/15 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                      <FiCalendar className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-white">
                        {new Date(c.mes + '-01').toLocaleDateString('pt-BR', { 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </p>
                      <div className="flex gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <FiZap className="text-xs" />
                          {c.consumo} kWh
                        </span>
                        <span className="flex items-center gap-1">
                          <FiDollarSign className="text-xs" />
                          R$ {c.valor.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => removerConta(c.mes)}
                    className="p-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-all duration-300 hover:scale-105"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Gráficos */}
        {contas.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/20 rounded-xl">
                <FiTrendingDown className="text-purple-400 text-xl" />
              </div>
              <h2 className="text-2xl font-semibold text-white">Análise de Consumo</h2>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-blue-400 mb-4 text-center">Consumo Mensal (kWh)</h3>
                <div className="h-80">
                  <Bar
                    data={{
                      labels: meses.sort(),
                      datasets: [{ 
                        label: 'Consumo (kWh)', 
                        data: meses.sort().map(m => {
                          const conta = contas.find(c => c.mes === m);
                          return conta ? conta.consumo : 0;
                        }),
                        backgroundColor: 'rgba(59, 130, 246, 0.8)',
                        borderColor: 'rgb(59, 130, 246)',
                        borderWidth: 2,
                        borderRadius: 8,
                      }]
                    }}
                    options={{ 
                      responsive: true, 
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          labels: { color: 'white' }
                        }
                      },
                      scales: {
                        x: {
                          ticks: { color: 'white' },
                          grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        },
                        y: {
                          ticks: { color: 'white' },
                          grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        }
                      }
                    }}
                  />
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-green-400 mb-4 text-center">Valor Mensal (R$)</h3>
                <div className="h-80">
                  <Bar
                    data={{
                      labels: meses.sort(),
                      datasets: [{ 
                        label: 'Valor (R$)', 
                        data: meses.sort().map(m => {
                          const conta = contas.find(c => c.mes === m);
                          return conta ? conta.valor : 0;
                        }),
                        backgroundColor: 'rgba(34, 197, 94, 0.8)',
                        borderColor: 'rgb(34, 197, 94)',
                        borderWidth: 2,
                        borderRadius: 8,
                      }]
                    }}
                    options={{ 
                      responsive: true, 
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          labels: { color: 'white' }
                        }
                      },
                      scales: {
                        x: {
                          ticks: { color: 'white' },
                          grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        },
                        y: {
                          ticks: { color: 'white' },
                          grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}