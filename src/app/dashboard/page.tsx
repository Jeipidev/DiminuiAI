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

// A interface agora inclui a propriedade "unidade"
interface Eletronico {
  nome: string;
  watts: string; // valor convertido (em W ou em kWh, conforme a unidade)
  horas: string;
  unidade: string; // "W" ou "kWh" (ou "V" que é convertido para W)
  voltagem?: number;
  corrente?: number;
  fp?: number;
  hz?: string;
  tipoTarifa?: string;
}

interface Tarifas {
  [key: string]: string;
}

export default function Dashboard() {
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);
  const [eletronicos, setEletronicos] = useState<Eletronico[]>([]);
  const [tarifas, setTarifas] = useState<Tarifas>({});
  // Aqui a lista de campos (chaves) de tarifa é armazenada e também persistida no Firestore
  const [tiposCampos, setTiposCampos] = useState<string[]>(["0_30_te"]);
  const [tarifasPreferencia, setTarifasPreferencia] = useState<"te" | "tsud">("te");

  const [novo, setNovo] = useState({
    nome: "",
    valor: "",
    unidade: "W", // "W", "kWh" ou "V"
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
        setTarifas(data.tarifas || {});
        setEletronicos(data.eletronicos || []);
        // Carrega a lista de campos de tarifa ou usa o valor padrão
        setTiposCampos(data.tiposCampos || ["0_30_te"]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  // Função para converter o valor informado para watts (ou manter se já estiver em kWh)
  const converterParaWatts = (
    valor: number,
    unidade: string,
    voltagem?: number,
    corrente?: number,
    fp?: number
  ): number => {
    if (unidade === "V" && voltagem && corrente && fp) {
      return voltagem * corrente * fp;
    }
    switch (unidade) {
      case "W": 
        return valor;
      case "kWh": 
        return valor; // valor informado já está em kWh/h
      default: 
        return valor;
    }
  };

  // Identifica a faixa de tarifa com base no consumo mensal (em kWh)
  const identificarTarifa = (kwh: number, preferencia: "te" | "tsud" = "te"): string => {
    if (kwh <= 30) return `0_30_${preferencia}`;
    if (kwh <= 100) return `30_100_${preferencia}`;
    return `100_220_${preferencia}`;
  };

  const handleAdd = async () => {
    if (!novo.nome || !novo.horas || !user) return;

    let valorConvertido = 0; // valor em W ou em kWh, conforme a unidade
    let consumoMensal = 0; // em kWh/mês
    let extra = {};

    if (novo.unidade === "V") {
      const v = parseFloat(novo.voltagem);
      const a = parseFloat(novo.corrente);
      const fp = parseFloat(novo.fp) || 1;
      if (!v || !a) return;
      valorConvertido = converterParaWatts(0, "V", v, a, fp);
      consumoMensal = (valorConvertido * parseFloat(novo.horas) * 30) / 1000;
      extra = { voltagem: v, corrente: a, fp, hz: novo.hz };
    } else if (novo.unidade === "kWh") {
      // Se for kWh, consideramos que é o consumo por hora
      valorConvertido = parseFloat(novo.valor);
      consumoMensal = valorConvertido * parseFloat(novo.horas);
    } else { // unidade "W"
      valorConvertido = converterParaWatts(parseFloat(novo.valor), "W");
      consumoMensal = (valorConvertido * parseFloat(novo.horas) * 30) / 1000;
    }

    const tipoTarifa = identificarTarifa(consumoMensal, tarifasPreferencia || "te");

    const novoObj: Eletronico = {
      nome: novo.nome,
      watts: valorConvertido.toFixed(2),
      horas: novo.horas,
      unidade: novo.unidade,
      tipoTarifa,
      ...extra
    };

    const novaLista = [...eletronicos, novoObj];
    setEletronicos(novaLista);
    setNovo({ nome: "", valor: "", unidade: "W", horas: "", voltagem: "", corrente: "", fp: "1", hz: "" });
    await setDoc(doc(db, "usuarios", user.uid), { eletronicos: novaLista }, { merge: true });
  };

  // Atualiza o campo de tarifa e salva a alteração no Firestore
  const handleValorTarifaChange = async (index: number, valor: string) => {
    const chave = tiposCampos[index];
    const novaTarifas = { ...tarifas, [chave]: valor };
    setTarifas(novaTarifas);
    if (user) {
      await setDoc(doc(db, "usuarios", user.uid), { tarifas: novaTarifas }, { merge: true });
    }
  };

  // Atualiza o tipo (chave) do campo de tarifa e persiste
  const handleTipoChange = async (index: number, novoTipo: string) => {
    const atualizados = [...tiposCampos];
    atualizados[index] = novoTipo;
    setTiposCampos(atualizados);
    if (user) {
      await setDoc(doc(db, "usuarios", user.uid), { tiposCampos: atualizados }, { merge: true });
    }
  };

  // Adiciona um novo campo de tarifa com uma chave única e salva no Firestore
  const handleAddTipoCampo = async () => {
    const novoTipo = `0_30_te`;
    const novosCampos = [...tiposCampos, novoTipo];
    setTiposCampos(novosCampos);
    if (user) {
      await setDoc(doc(db, "usuarios", user.uid), { tiposCampos: novosCampos }, { merge: true });
    }
  };

  // Função para salvar (ou atualizar) as tarifas e os campos de tarifa
  const handleSalvarTarifas = async (): Promise<void> => {
    if (user) {
      await setDoc(doc(db, "usuarios", user.uid), { tarifas, tiposCampos }, { merge: true });
    }
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

  // Cálculo do consumo mensal e custo com base na unidade e tarifa cadastrada
  const consumoTotal = eletronicos.reduce((total, e) => {
    let kwhMes = 0;
    if (e.unidade === "kWh") {
      kwhMes = parseFloat(e.watts) * parseFloat(e.horas);
    } else {
      kwhMes = (parseFloat(e.watts) * parseFloat(e.horas) * 30) / 1000;
    }
    const tarifaStr = tarifas[e.tipoTarifa || ""] || "0";
    const tarifa = parseFloat(tarifaStr.replace(",", "."));
    return total + kwhMes * tarifa;
  }, 0);

  const graficoConsumo = {
    labels: eletronicos.map(e => e.nome),
    datasets: [{
      label: 'Consumo (kWh/mês)',
      data: eletronicos.map(e => {
        if (e.unidade === "kWh") {
          return parseFloat(e.watts) * parseFloat(e.horas);
        } else {
          return (parseFloat(e.watts) * parseFloat(e.horas) * 30) / 1000;
        }
      }),
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

  const sair = async (): Promise<void> => {
    await signOut(auth);
    router.push("/");
  };

  if (loading) return null;

  return (
    <div className="min-h-screen pt-[80px] bg-[#0D1117] text-white p-4 space-y-10">
      <Header nome={user?.displayName || user.email} />


      <div className="bg-[#161B22] p-6 rounded-2xl shadow-md">
      <h2 className="text-xl mb-4 font-semibold text-[#00BFFF]">Cadastro de Tarifas</h2>
{tiposCampos.map((tipo, i) => (
  <div
    key={i}
    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-3"
  >
    <select
      value={tipo}
      onChange={(e) => handleTipoChange(i, e.target.value)}
      className="w-full sm:w-40 p-3 rounded-xl bg-[#1E1E2F] text-white border border-white/20"
    >
      <option value="0_30_te">0-30 kWh (TE)</option>
      <option value="0_30_tsud">0-30 kWh (TSUD)</option>
      <option value="30_100_te">30-100 kWh (TE)</option>
      <option value="30_100_tsud">30-100 kWh (TSUD)</option>
      <option value="100_220_te">100-220 kWh (TE)</option>
      <option value="100_220_tsud">100-220 kWh (TSUD)</option>
    </select>
    <input
      type="number"
      placeholder="Valor R$/kWh"
      className="w-full p-3 rounded-xl bg-[#1E1E2F] text-white border border-white/20"
      value={tarifas[tipo] || ""}
      onChange={(e) => handleValorTarifaChange(i, e.target.value)}
    />
  </div>
))}

        <button
          onClick={handleAddTipoCampo}
          className="w-full px-4 py-2 bg-[#00BFFF] text-black rounded-xl font-semibold mt-3 hover:scale-105 transition"
        >
          Adicionar novo tipo de consumo
        </button>
        <button
          onClick={handleSalvarTarifas}
          className="w-full px-4 py-2 mt-4 bg-green-500 text-black rounded-xl hover:scale-105 transition"
        >
          Salvar Tarifas
        </button>
      </div>

      {/* Adicionar Aparelho */}
      <div className="bg-[#161B22] p-6 rounded-2xl shadow-md space-y-4">
        <h2 className="text-xl font-semibold text-[#00BFFF]">Adicionar Aparelho</h2>
        <input
          className="w-full p-3 rounded-xl bg-[#1E1E2F] text-white"
          placeholder="Nome do Aparelho"
          value={novo.nome}
          onChange={(e) => setNovo({ ...novo, nome: e.target.value })}
        />
        {novo.unidade === "V" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              className="p-3 rounded-xl bg-[#1E1E2F] text-white"
              placeholder="Voltagem (V)"
              type="number"
              value={novo.voltagem}
              onChange={(e) => setNovo({ ...novo, voltagem: e.target.value })}
            />
            <input
              className="p-3 rounded-xl bg-[#1E1E2F] text-white"
              placeholder="Corrente (A)"
              type="number"
              value={novo.corrente}
              onChange={(e) => setNovo({ ...novo, corrente: e.target.value })}
            />
            <input
              className="p-3 rounded-xl bg-[#1E1E2F] text-white"
              placeholder="Fator de Potência"
              type="number"
              value={novo.fp}
              onChange={(e) => setNovo({ ...novo, fp: e.target.value })}
            />
          </div>
        ) : (
          <input
            className="w-full p-3 rounded-xl bg-[#1E1E2F] text-white"
            placeholder={novo.unidade === "kWh" ? "Consumo (kWh)" : "Potência (ex: 1000)"}
            type="number"
            value={novo.valor}
            onChange={(e) => setNovo({ ...novo, valor: e.target.value })}
          />
        )}
        <div className="flex gap-4">
          <select
            className="w-full p-3 rounded-xl bg-[#1E1E2F] text-white border border-white/20"
            value={novo.unidade}
            onChange={(e) => setNovo({ ...novo, unidade: e.target.value })}
          >
            <option value="W">W</option>
            <option value="kWh">kWh</option>
            <option value="V">Volts</option>
          </select>
          <input
            className="w-full p-3 rounded-xl bg-[#1E1E2F] text-white"
            placeholder="Horas/dia"
            type="number"
            value={novo.horas}
            onChange={(e) => setNovo({ ...novo, horas: e.target.value })}
          />
        </div>
        <button
          onClick={handleAdd}
          className="w-full px-6 py-3 bg-[#00BFFF] text-black rounded-2xl font-semibold shadow hover:scale-105 transition"
        >
          Adicionar Aparelho
        </button>
      </div>

      {/* Lista de Aparelhos */}
      <div className="bg-[#161B22] p-6 rounded-2xl shadow-md space-y-4">
        <h2 className="text-xl font-semibold text-[#00BFFF]">Seus Aparelhos</h2>
        {eletronicos.map((el, i) => {
          let kwhMes = 0;
          if (el.unidade === "kWh") {
            kwhMes = parseFloat(el.watts) * parseFloat(el.horas);
          } else {
            kwhMes = (parseFloat(el.watts) * parseFloat(el.horas) * 30) / 1000;
          }
          const tarifaStr = tarifas[el.tipoTarifa || ""] || "0";
          const tarifa = parseFloat(tarifaStr.replace(",", "."));
          const custo = kwhMes * tarifa;
          return (
            <div key={i} className="flex items-center gap-4 bg-[#1E1E2F] p-4 rounded-xl">
              <div className="flex-1">
                <p className="text-lg font-bold">{el.nome}</p>
                <p className="text-sm text-gray-300">
                  {el.watts}{el.unidade} - {el.tipoTarifa} - {kwhMes.toFixed(2)} kWh/mês - R$ {custo.toFixed(2)}
                </p>
              </div>
              <input
                type="number"
                className="w-24 p-2 rounded bg-[#111827] text-white"
                value={el.horas}
                onChange={(e) => handleEditHoras(i, e.target.value)}
              />
              <button
                onClick={() => handleRemove(i)}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Remover
              </button>
            </div>
          );
        })}
      </div>

      {/* Resultado Total */}
      <div className="text-lg bg-[#161B22] p-6 rounded-xl">
        <p className="mb-2">
          Custo total estimado:
          <span className="text-[#00BFFF] font-bold"> R$ {consumoTotal.toFixed(2)}</span>
        </p>
      </div>

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
