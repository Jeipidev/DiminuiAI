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
import { FiTarget, FiCheckCircle } from 'react-icons/fi';
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

  if (loading) return <div className="min-h-screen flex justify-center items-center text-white">Carregando...</div>;

  return (
    <>
      <Header nome={user?.displayName || user?.email} />
      <div className="min-h-screen bg-[#0D1117] text-white p-6 sm:p-10 font-sans space-y-12 my-20">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3 text-[#00BFFF] drop-shadow-[0_0_12px_#00BFFF]">
            <FiTarget className="text-4xl" />
            Minhas Metas
          </h1>
          <div className="flex items-center gap-2 text-sm sm:text-base text-gray-300">
            <FiCheckCircle className="text-green-400 text-xl" />
            Metas concluídas no total: <span className="font-semibold text-white">{totalConcluidas}</span>
          </div>
        </motion.header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {[{ titulo: 'Metas Semanais', metas: semanais, tipo: 'semanais' as const }, { titulo: 'Metas Mensais', metas: mensais, tipo: 'mensais' as const }].map(({ titulo, metas, tipo }) => (
            <div key={tipo} className="bg-[#161B22] p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-4">{titulo}</h2>
              <div className="space-y-3">
              {metas.map((meta, index) => (
  <div key={`${meta.id}-${index}`} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#1E1E2F] p-4 rounded">
    <div>
      <p className={`font-medium ${meta.concluida ? 'line-through text-gray-400' : ''}`}>
        {meta.titulo}
      </p>
      <div className="w-full bg-gray-700 rounded h-2 mt-2">
        <div className="bg-[#00BFFF] h-2 rounded" style={{ width: `${meta.progresso}%` }}></div>
      </div>
    </div>
    <button
      onClick={() => concluirMeta(tipo, meta.id)}
      disabled={meta.concluida}
      className={`mt-3 sm:mt-0 sm:ml-4 px-4 py-2 rounded-lg text-sm font-medium transition ${meta.concluida
        ? 'bg-green-600 cursor-default'
        : 'bg-[#00BFFF] text-black hover:scale-105 drop-shadow-[0_0_6px_#00BFFF]'}`}
    >
      {meta.concluida ? 'Concluída' : 'Concluir'}
    </button>
  </div>
))}

              </div>
            </div>
          ))}
        </section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#161B22] p-6 rounded-xl max-w-xl mx-auto"
        >
          <h2 className="text-xl font-semibold mb-4 text-center text-[#00BFFF]">Resumo Geral</h2>
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
                  backgroundColor: ['#00BFFF', '#1E1E2F']
                }
              ]
            }}
            options={{ responsive: true }}
          />
        </motion.section>
      </div>
    </>
  );
}
