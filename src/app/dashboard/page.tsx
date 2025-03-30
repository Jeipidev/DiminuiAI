'use client';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../../firebase';
import { useRouter } from 'next/navigation';
import {
  Chart,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from 'firebase/firestore';

Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);
const db = getFirestore();

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [eletronicos, setEletronicos] = useState<any[]>([]);
  const [tarifas, setTarifas] = useState<string[]>(['']);
  const [novo, setNovo] = useState({ nome: '', valor: '', unidade: 'W', horas: '' });
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!u) return router.push('/login');
      setUser(u);
      const docRef = doc(db, 'usuarios', u.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setTarifas(data.tarifas || ['']);
        setEletronicos(data.eletronicos || []);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const converterParaWatts = (valor: number, unidade: string) => {
    switch (unidade) {
      case 'W': return valor;
      case 'kW': return valor * 1000;
      case 'VA': return valor * 0.9;
      case 'V': return valor * 0.1;
      case 'kWh': return (valor * 1000) / (30 * (parseFloat(novo.horas) || 1));
      default: return valor;
    }
  };

  const handleAdd = async () => {
    if (!novo.nome || !novo.valor || !novo.horas || !user) return;
    const watts = converterParaWatts(parseFloat(novo.valor), novo.unidade).toFixed(2);
    const novoObj = { nome: novo.nome, watts, horas: novo.horas };
    const novaLista = [...eletronicos, novoObj];
    setEletronicos(novaLista);
    setNovo({ nome: '', valor: '', unidade: 'W', horas: '' });
    await setDoc(doc(db, 'usuarios', user.uid), { eletronicos: novaLista }, { merge: true });
  };

  const handleRemove = async (index: number) => {
    const novaLista = eletronicos.filter((_, i) => i !== index);
    setEletronicos(novaLista);
    await setDoc(doc(db, 'usuarios', user.uid), { eletronicos: novaLista }, { merge: true });
  };

  const handleEditHoras = async (index: number, horas: string) => {
    const novaLista = eletronicos.map((item, i) => i === index ? { ...item, horas } : item);
    setEletronicos(novaLista);
    await setDoc(doc(db, 'usuarios', user.uid), { eletronicos: novaLista }, { merge: true });
  };

  const handleTarifaChange = (i: number, value: string) => {
    const novaTarifas = tarifas.map((t, idx) => idx === i ? value : t);
    setTarifas(novaTarifas);
  };

  const handleAddTarifa = () => {
    setTarifas([...tarifas, '']);
  };

  const handleSalvarTarifas = async () => {
    if (user) {
      await setDoc(doc(db, 'usuarios', user.uid), { tarifas }, { merge: true });
    }
  };

  const mediaTarifa = tarifas.reduce((sum, t) => sum + (parseFloat(t) || 0), 0) / tarifas.length;
  const consumoTotal = eletronicos.reduce((total, e) =>
    total + (parseFloat(e.watts) * parseFloat(e.horas) * 30 / 1000), 0);
  const custoTotal = mediaTarifa ? consumoTotal * mediaTarifa : 0;

  const graficoConsumo = {
    labels: eletronicos.map(e => e.nome),
    datasets: [{
      label: 'Consumo (kWh/mês)',
      data: eletronicos.map(e =>
        (parseFloat(e.watts) * parseFloat(e.horas) * 30 / 1000)),
      backgroundColor: '#00BFFF'
    }]
  };

  const graficoUso = {
    labels: eletronicos.map(e => e.nome),
    datasets: [{
      label: 'Horas por dia',
      data: eletronicos.map(e => parseFloat(e.horas)),
      backgroundColor: ['#00BFFF', '#1E90FF', '#87CEFA', '#4682B4', '#5F9EA0']
    }]
  };

  const sair = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#0D1117] text-white p-6 sm:p-10 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-10">
        <h1 className="text-4xl font-bold text-[#00BFFF] drop-shadow-[0_0_12px_#00BFFF]">
          Olá, {user?.displayName || user.email}
        </h1>
        <button
          onClick={sair}
          className="px-5 py-3 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Sair
        </button>
      </div>

      {/* Tarifas + Adicionar eletrônico */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
        {/* Tarifas */}
        <div className="bg-[#161B22] p-6 rounded-2xl shadow-md">
          <h2 className="text-xl mb-3 font-semibold text-[#00BFFF]">Tarifas de Luz (R$/kWh)</h2>
          {tarifas.map((tarifa, i) => (
            <div key={i} className="relative">
              <input
                type="number"
                placeholder={`Tarifa ${i + 1}`}
                className="w-full mb-2 p-3 rounded-xl border border-white/40 bg-[#1E1E2F] text-white placeholder:text-gray-400"
                value={tarifa}
                onChange={e => handleTarifaChange(i, e.target.value)}
              />
              <span className="absolute right-4 top-3 text-gray-300">kWh</span>
            </div>
          ))}
          <div className="flex flex-col gap-3 mt-4">
            <button
              onClick={handleAddTarifa}
              className="w-full px-6 py-3 bg-[#00BFFF] text-black rounded-2xl font-semibold shadow-xl hover:scale-105 transition drop-shadow-[0_0_8px_#00BFFF]"
            >
              Adicionar tarifa
            </button>
            <button
              onClick={handleSalvarTarifas}
              className="py-2 px-4 bg-green-500 text-black rounded-xl hover:scale-105 transition drop-shadow-[0_0_6px_#00FFBF]"
            >
              Salvar tarifas
            </button>
          </div>
        </div>

        {/* Formulário novo eletrônico */}
        <div className="bg-[#161B22] p-6 rounded-2xl shadow-md">
          <h2 className="text-xl mb-3 font-semibold text-[#00BFFF]">Adicionar Eletrônico</h2>
          <div className="grid gap-3">
            <input
              placeholder="Nome"
              className="p-3 rounded-xl bg-[#1E1E2F] text-white"
              value={novo.nome}
              onChange={e => setNovo({ ...novo, nome: e.target.value })}
            />
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Valor"
                className="flex-1 p-3 rounded-xl bg-[#1E1E2F] text-white"
                value={novo.valor}
                onChange={e => setNovo({ ...novo, valor: e.target.value })}
              />
              <select
                className="w-28 p-3 rounded-xl bg-[#1E1E2F] text-white border border-white/20"
                value={novo.unidade}
                onChange={e => setNovo({ ...novo, unidade: e.target.value })}
              >
                <option value="W">W</option>
                <option value="kW">kW</option>
                <option value="VA">VA</option>
                <option value="V">Volts</option>
                <option value="kWh">kWh</option>
              </select>
            </div>
            <input
              type="number"
              placeholder="Horas/dia"
              className="p-3 rounded-xl bg-[#1E1E2F] text-white"
              value={novo.horas}
              onChange={e => setNovo({ ...novo, horas: e.target.value })}
            />
            <button
              onClick={handleAdd}
              className="w-full px-6 py-3 bg-[#00BFFF] text-black rounded-2xl font-semibold shadow-xl hover:scale-105 transition drop-shadow-[0_0_8px_#00BFFF]"
            >
              Adicionar
            </button>
          </div>
        </div>
      </div>

      {/* Lista de eletrônicos */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-[#00BFFF] mb-4">Seus Eletrônicos</h2>
        <div className="space-y-4">
          {eletronicos.map((el, i) => (
            <div key={i} className="flex items-center gap-4 bg-[#1E1E2F] p-4 rounded-xl">
              <div className="flex-1">
                <p className="text-lg font-bold">{el.nome}</p>
                <p className="text-sm text-gray-300">{el.watts}W</p>
              </div>
              <input
                type="number"
                className="w-24 p-2 rounded bg-[#111827] text-white"
                value={el.horas}
                onChange={e => handleEditHoras(i, e.target.value)}
              />
              <button
                onClick={() => handleRemove(i)}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Remover
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Resultado final */}
      <div className="text-lg mb-10 bg-[#161B22] p-6 rounded-xl">
        <p className="mb-2">
          Consumo total estimado: <span className="text-[#00BFFF] font-bold">{consumoTotal.toFixed(2)} kWh/mês</span>
        </p>
        <p>
          Custo mensal estimado: <span className="text-[#00BFFF] font-bold">R$ {custoTotal.toFixed(2)}</span>
        </p>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-[#161B22] p-6 rounded-xl shadow-lg">
          <h3 className="text-lg mb-4 font-semibold text-[#00BFFF]">Consumo por Aparelho</h3>
          <Bar data={graficoConsumo} options={{ responsive: true }} />
        </div>
        <div className="bg-[#161B22] p-6 rounded-xl shadow-lg">
          <h3 className="text-lg mb-4 font-semibold text-[#00BFFF]">Tempo de Uso por Aparelho</h3>
          <Pie data={graficoUso} options={{ responsive: true }} />
        </div>
      </div>
    </div>
  );
}
