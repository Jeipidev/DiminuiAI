'use client';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../firebase';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { conquistas } from '@/utils/conquistas';
import { Pie } from 'react-chartjs-2';
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
  FiCheckCircle
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

  // Filtra as conquistas para progressão: se a conquista tiver um 'prev', ela só aparece se o 'prev' estiver desbloqueado
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
    <>
      <Header nome={user?.displayName || user?.email || ''} />
      <div className="min-h-screen bg-[#0D1117] text-white p-6 sm:p-10 font-sans pt-28 space-y-12 my-20">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3 text-[#00BFFF] drop-shadow-[0_0_12px_#00BFFF]">
            <FiAward className="text-4xl" />
            Minhas Conquistas
          </h1>
        </header>

        <section className="bg-[#161B22] p-6 rounded-xl max-w-xl mx-auto">
          <h2 className="text-xl font-semibold mb-4 text-center text-[#00BFFF]">Progresso Geral</h2>
          <Pie
            data={{
              labels: ['Desbloqueadas', 'Pendentes'],
              datasets: [{
                data: [desbloqueadas.length, conquistas.length - desbloqueadas.length],
                backgroundColor: ['#00BFFF', '#1E1E2F']
              }]
            }}
            options={{ responsive: true }}
          />
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {conquistasFiltradas.map(c => {
            const ativo = desbloqueadas.includes(c.id);
            const cor = c.dificuldade === 'fácil'
              ? 'text-green-400'
              : c.dificuldade === 'médio'
              ? 'text-yellow-300'
              : 'text-red-400';

            return (
              <div
                key={`${c.id}-${Math.random().toString(36).substr(2,5)}`}
                className={`bg-[#161B22] p-4 rounded-xl shadow-md border transition-all ${ativo
                  ? 'border-[#00BFFF]'
                  : 'border-white/10 opacity-50 grayscale'}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {getIcon(c.tipo)}
                  <h3 className="text-lg font-semibold text-white">{c.titulo}</h3>
                  {c.dificuldade && (
                    <span className={`ml-auto text-xs px-2 py-1 rounded-full bg-white/10 ${cor}`}>
                      {c.dificuldade}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400">{c.descricao}</p>
                <span className="text-xs mt-2 inline-block text-gray-500">
                  Tipo: {c.tipo} | Condição: {c.condicao}
                </span>
              </div>
            );
          })}
        </section>
      </div>
    </>
  );
}
