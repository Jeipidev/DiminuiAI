'use client';
import { useState, useEffect } from 'react';
import { auth } from '../../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import Header from '@/components/Header';
import { Bar } from 'react-chartjs-2';
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

  const calcularEconomia = (contas: any[]) => {
    if (contas.length < 2) return 0;
    const sorted = [...contas].sort((a, b) => new Date(a.mes).getTime() - new Date(b.mes).getTime());
    const primeira = sorted[0];
    const ultima = sorted[sorted.length - 1];
    const economia = primeira.valor - ultima.valor;
    return economia > 0 ? economia : 0;
  };

  const economiaTotal = calcularEconomia(contas);
  const meses = contas.map(c => c.mes);
  const consumos = contas.map(c => c.consumo);
  const valores = contas.map(c => c.valor);

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
  

  return (
    <>
      <Header nome={user?.displayName || user?.email || ''} />
      <div className="min-h-screen bg-[#0D1117] text-white pt-28 p-6 sm:p-10 space-y-12 font-sans">
        <h1 className="text-3xl font-bold text-[#00BFFF] drop-shadow-[0_0_12px_#00BFFF]">
          Registro de Contas de Luz
        </h1>

        <div className="bg-[#161B22] p-6 rounded-xl max-w-xl space-y-4">
          <h2 className="text-xl font-semibold">Adicionar Conta</h2>
          <input type="month" value={mes} onChange={e => setMes(e.target.value)}
            className="w-full p-3 rounded-lg bg-[#1E1E2F] text-white" />
          <input type="number" placeholder="Consumo (kWh)" value={kwh} onChange={e => setKwh(e.target.value)}
            className="w-full p-3 rounded-lg bg-[#1E1E2F] text-white" />
          <input type="number" placeholder="Valor total (R$)" value={valor} onChange={e => setValor(e.target.value)}
            className="w-full p-3 rounded-lg bg-[#1E1E2F] text-white" />
          <button onClick={adicionarConta}
            className="w-full py-3 bg-[#00BFFF] text-black font-semibold rounded-lg hover:scale-105 transition drop-shadow-[0_0_6px_#00BFFF]">
            Salvar Conta
          </button>
        </div>

        <div className="bg-[#161B22] p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Contas Registradas</h2>
          <p className="text-sm text-green-400">
  Economia total estimada: R$ {economiaReais.toFixed(2)} / {economiaKwh.toFixed(1)} kWh
</p>

          <ul className="space-y-3">
            {contas
              .sort((a, b) => a.mes.localeCompare(b.mes))
              .map((c, i) => (
              <li key={i} className="flex justify-between items-center bg-[#1E1E2F] p-4 rounded-lg">
                <span>{c.mes}</span>
                <span>{c.consumo} kWh</span>
                <span>R$ {c.valor.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#161B22] p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-6 text-center">Gráficos de Consumo e Valor</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="mb-2 font-medium text-[#00BFFF] text-center">Consumo (kWh)</h3>
              <Bar
                data={{
                  labels: meses,
                  datasets: [{ label: 'Consumo (kWh)', data: consumos, backgroundColor: '#00BFFF' }]
                }}
                options={{ responsive: true }}
              />
            </div>
            <div>
              <h3 className="mb-2 font-medium text-[#00BFFF] text-center">Valor (R$)</h3>
              <Bar
                data={{
                  labels: meses,
                  datasets: [{ label: 'Valor (R$)', data: valores, backgroundColor: '#1E90FF' }]
                }}
                options={{ responsive: true }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
