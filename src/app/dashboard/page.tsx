"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../../firebase";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import {
  Chart,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";

Chart.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);
const db = getFirestore();

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [eletronicos, setEletronicos] = useState<any[]>([]);
  const [tarifas, setTarifas] = useState<string[]>([""]);
  const [menuAberto, setMenuAberto] = useState(false);
  const [novo, setNovo] = useState({
    nome: "",
    valor: "",
    unidade: "W",
    horas: "",
    voltagem: "",
    hz: "",
    fp: "1",
    corrente: ""
  });  
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!u) return router.push("/login");
      setUser(u);
      const docRef = doc(db, "usuarios", u.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setTarifas(data.tarifas || [""]);
        setEletronicos(data.eletronicos || []);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const converterParaWatts = (
    valor: number,
    unidade: string,
    voltagem?: number,
    corrente?: number,
    fp?: number
  ) => {
    if (unidade === "V" && voltagem && corrente && fp) {
      return voltagem * corrente * fp;
    }
    switch (unidade) {
      case "W": return valor;
      case "kWh": return valor * 1000;
      default: return valor;
    }
  };
  
  
  

  const handleAdd = async () => {
    if (!novo.nome || !novo.horas || !user) return;
  
    let watts = 0;
    let extra = {};
  
    if (novo.unidade === "V") {
      const v = parseFloat(novo.voltagem);
      const a = parseFloat(novo.corrente);
      const fp = parseFloat(novo.fp) || 1;
  
      if (!v || !a) return;
  
      watts = converterParaWatts(0, "V", v, a, fp);
  
      extra = {
        voltagem: v,
        corrente: a,
        fp,
        hz: novo.hz
      };
    } else {
      if (!novo.valor) return;
      watts = converterParaWatts(parseFloat(novo.valor), novo.unidade);
    }
  
    const novoObj = {
      nome: novo.nome,
      watts: watts.toFixed(2),
      horas: novo.horas,
      ...extra
    };
  
    const novaLista = [...eletronicos, novoObj];
    setEletronicos(novaLista);
    setNovo({
      nome: "",
      valor: "",
      unidade: "W",
      horas: "",
      voltagem: "",
      corrente: "",
      fp: "1",
      hz: ""
    });
    await setDoc(doc(db, "usuarios", user.uid), { eletronicos: novaLista }, { merge: true });
  };
  
  const handleRemove = async (index: number) => {
    const novaLista = eletronicos.filter((_, i) => i !== index);
    setEletronicos(novaLista);
    await setDoc(doc(db, "usuarios", user.uid), { eletronicos: novaLista }, { merge: true });
  };

  const handleEditHoras = async (index: number, horas: string) => {
    const novaLista = eletronicos.map((item, i) => i === index ? { ...item, horas } : item);
    setEletronicos(novaLista);
    await setDoc(doc(db, "usuarios", user.uid), { eletronicos: novaLista }, { merge: true });
  };

  const handleTarifaChange = (i: number, value: string) => {
    const novaTarifas = tarifas.map((t, idx) => idx === i ? value : t);
    setTarifas(novaTarifas);
  };

  const handleAddTarifa = () => {
    setTarifas([...tarifas, ""]);
  };

  const handleSalvarTarifas = async () => {
    if (user) {
      await setDoc(doc(db, "usuarios", user.uid), { tarifas }, { merge: true });
    }
  };

  const mediaTarifa = tarifas.reduce((sum, t) => sum + (parseFloat(t) || 0), 0) / tarifas.length;
  const consumoTotal = eletronicos.reduce((total, e) =>
    total + (parseFloat(e.watts) * parseFloat(e.horas) * 30 / 1000), 0);
  const custoTotal = mediaTarifa ? consumoTotal * mediaTarifa : 0;

  const graficoConsumo = {
    labels: eletronicos.map(e => e.nome),
    datasets: [{
      label: 'Consumo (kWh/m\u00eas)',
      data: eletronicos.map(e => (parseFloat(e.watts) * parseFloat(e.horas) * 30 / 1000)),
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
    router.push("/");
  };

  if (loading) return null;

  return (
    <>
    

<Header nome={user?.displayName || user.email}>
</Header>
      
      <div className="min-h-screen pt-[80px] bg-[#0D1117] text-white my-10 p-4 sm:p-6 md:p-10 font-sans space-y-10">
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
        <div className="flex flex-col gap-4">
  <input
    placeholder="Nome"
    className="w-full p-3 rounded-xl bg-[#1E1E2F] text-white"
    value={novo.nome}
    onChange={e => setNovo({ ...novo, nome: e.target.value })}
  />

  <div className="flex flex-col sm:flex-row gap-3">
    {novo.unidade === "V" ? (
      <div className="flex flex-col gap-3 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="number"
            placeholder="Voltagem (V)"
            className="p-3 rounded-xl bg-[#1E1E2F] text-white"
            value={novo.voltagem}
            onChange={e => setNovo({ ...novo, voltagem: e.target.value })}
          />
          <input
            type="number"
            placeholder="Corrente (A)"
            className="p-3 rounded-xl bg-[#1E1E2F] text-white"
            value={novo.corrente}
            onChange={e => setNovo({ ...novo, corrente: e.target.value })}
          />
          <input
            type="number"
            placeholder="Fator de Potência"
            className="p-3 rounded-xl bg-[#1E1E2F] text-white"
            value={novo.fp}
            onChange={e => setNovo({ ...novo, fp: e.target.value })}
          />
        </div>
        <input
          type="number"
          placeholder="Frequência (Hz) - opcional"
          className="p-3 rounded-xl bg-[#1E1E2F] text-white"
          value={novo.hz}
          onChange={e => setNovo({ ...novo, hz: e.target.value })}
        />
      </div>
    ) : (
      <input
        type="number"
        placeholder="Potência (ex: 1000)"
        className="w-full p-3 rounded-xl bg-[#1E1E2F] text-white"
        value={novo.valor}
        onChange={e => setNovo({ ...novo, valor: e.target.value })}
      />
    )}

    <select
      className="w-full sm:w-28 p-3 rounded-xl bg-[#1E1E2F] text-white border border-white/20"
      value={novo.unidade}
      onChange={e => setNovo({ ...novo, unidade: e.target.value })}
    >
      <option value="W">W</option>
      <option value="V">Volts</option>
      <option value="kWh">kWh</option>
    </select>
  </div>

  <input
    type="number"
    placeholder="Horas/dia"
    className="w-full p-3 rounded-xl bg-[#1E1E2F] text-white"
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

      {/* Lista de eletrônicos */}
      <div className="mb-10 p-4 sm:p-6 md:p-10 font-sans space-y-10 bg-[#0D1117] text-white">
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
      <div className="mb-10 p-4 sm:p-6 md:p-10 font-sans space-y-10 bg-[#0D1117] text-white">
      <div className="text-lg mb-10 bg-[#161B22] p-6 rounded-xl">
        <p className="mb-2">
          Consumo total estimado: <span className="text-[#00BFFF] font-bold">{consumoTotal.toFixed(2)} kWh/mês</span>
        </p>
        <p>
          Custo mensal estimado: <span className="text-[#00BFFF] font-bold">R$ {custoTotal.toFixed(2)}</span>
        </p>
      </div>
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
    </>
  );
}
