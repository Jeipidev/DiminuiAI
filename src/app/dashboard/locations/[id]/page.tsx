"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../../../firebase";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import Link from "next/link";
import { FiTrash2 } from "react-icons/fi";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);
const db = getFirestore();

interface Eletronico {
  id: string;
  nome: string;
  watts: string; // valor convertido (em W ou em kWh)
  horas: string;
  unidade: string; // "W", "kWh" ou "V"
  voltagem?: number;
  corrente?: number;
  fp?: number;
  hz?: string;
  tipoTarifa: string;
  roomId?: string; // novo campo para identificar o cômodo
}

interface Room {
  id: string;
  name: string;
}

interface Location {
  id: string;
  name: string;
  devices: Eletronico[];
  tarifas: { [key: string]: string }; // Ex.: { "0_30_te": "0.5", "0_30_tsud": "0.2", ... }
  rooms: Room[];
  tiposCampos?: string[];
  modoFixo?: boolean;
}

export default function LocationPage() {
  const { id } = useParams(); // ID do local na URL
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [locationData, setLocationData] = useState<Location | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [devices, setDevices] = useState<Eletronico[]>([]);
  const [tarifas, setTarifas] = useState<{ [key: string]: string }>({});
  const [tiposCampos, setTiposCampos] = useState<string[]>([
    "0_30_te",
    "30_100_te",
    "100_220_te",
  ]);
  const [modoFixo, setModoFixo] = useState<boolean>(false);
  // Estado para os cômodos e para criar um novo
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoomName, setNewRoomName] = useState("");
  // Estado para o formulário de novo dispositivo (agora com roomId)
  const [novo, setNovo] = useState({
    nome: "",
    valor: "",
    unidade: "W",
    horas: "",
    voltagem: "",
    hz: "",
    fp: "1",
    corrente: "",
    roomId: "",
  });

  // Atualiza o local no Firestore (dentro do array "locations" do usuário)
  const updateLocationFirestore = async (updatedLoc: Location) => {
    if (user) {
      const userRef = doc(db, "usuarios", user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        const locs: Location[] = data.locations || [];
        const updatedLocs = locs.map((loc) =>
          loc.id === updatedLoc.id ? updatedLoc : loc
        );
        await setDoc(userRef, { locations: updatedLocs }, { merge: true });
      }
    }
  };

  // Salva configurações de tarifas, tiposCampos, modoFixo e cômodos para o local
  const handleSalvarTarifas = async (): Promise<void> => {
    if (user && locationData) {
      const updatedLocation: Location = {
        ...locationData,
        tarifas,
        tiposCampos,
        modoFixo,
        rooms,
      };
      setLocationData(updatedLocation);
      await updateLocationFirestore(updatedLocation);
    }
  };

  // Função para adicionar um cômodo
  const addRoom = async () => {
    if (!newRoomName.trim()) return;
    const newRoom: Room = {
      id: Math.random().toString(36).substr(2, 9),
      name: newRoomName,
    };
    const updatedRooms = [...rooms, newRoom];
    setRooms(updatedRooms);
    if (locationData) {
      const updatedLocation = { ...locationData, rooms: updatedRooms };
      setLocationData(updatedLocation);
      await updateLocationFirestore(updatedLocation);
    }
    setNewRoomName("");
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push("/login");
      } else {
        setUser(u);
        const userRef = doc(db, "usuarios", u.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          const locs: Location[] = data.locations || [];
          const loc = locs.find((l) => l.id === id);
          if (loc) {
            setLocationData(loc);
            setDevices(loc.devices || []);
            setTarifas(loc.tarifas || {});
            setRooms(loc.rooms || []);
            setTiposCampos(loc.tiposCampos || ["0_30_te", "30_100_te", "100_220_te"]);
            setModoFixo(loc.modoFixo || false);
          }
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router, id]);

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
        return valor;
      default:
        return valor;
    }
  };

  const identificarTarifa = (kwh: number, preferencia: "te" | "tsud" = "te"): string => {
    if (kwh <= 30) return `0_30_${preferencia}`;
    if (kwh <= 100) return `30_100_${preferencia}`;
    return `100_220_${preferencia}`;
  };

  const handleAddDevice = async () => {
    if (!novo.nome || !novo.horas || !user || !locationData) return;
    let valorConvertido = 0;
    let consumoMensal = 0;
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
      valorConvertido = parseFloat(novo.valor);
      consumoMensal = valorConvertido * parseFloat(novo.horas);
    } else {
      valorConvertido = converterParaWatts(parseFloat(novo.valor), "W");
      consumoMensal = (valorConvertido * parseFloat(novo.horas) * 30) / 1000;
    }
    const tipoTarifa = modoFixo ? "fixo" : identificarTarifa(consumoMensal, "te");
    const newDevice: Eletronico = {
      id: Math.random().toString(36).substr(2, 9),
      nome: novo.nome,
      watts: valorConvertido.toFixed(2),
      horas: novo.horas,
      unidade: novo.unidade,
      tipoTarifa,
      roomId: novo.roomId, // atribui o cômodo selecionado
      ...extra,
    };
    const updatedDevices = [...devices, newDevice];
    setDevices(updatedDevices);
    const updatedLocation = { ...locationData, devices: updatedDevices };
    setLocationData(updatedLocation);
    await updateLocationFirestore(updatedLocation);
    setNovo({
      nome: "",
      valor: "",
      unidade: "W",
      horas: "",
      voltagem: "",
      corrente: "",
      fp: "1",
      hz: "",
      roomId: "",
    });
  };

  const handleRemoveDevice = async (deviceId: string) => {
    if (!locationData) return;
    const updatedDevices = devices.filter((d) => d.id !== deviceId);
    setDevices(updatedDevices);
    const updatedLocation = { ...locationData, devices: updatedDevices };
    setLocationData(updatedLocation);
    await updateLocationFirestore(updatedLocation);
  };

  const handleTariffChange = async (key: string, valor: string) => {
    const updatedTarifas = { ...tarifas, [key]: valor };
    setTarifas(updatedTarifas);
    if (locationData) {
      const updatedLocation = { ...locationData, tariffs: updatedTarifas };
      setLocationData(updatedLocation);
      await updateLocationFirestore(updatedLocation);
    }
  };

  const handleEditHoras = async (deviceId: string, novasHoras: string) => {
    const updatedDevices = devices.map((d) =>
      d.id === deviceId ? { ...d, horas: novasHoras } : d
    );
    setDevices(updatedDevices);
    if (locationData) {
      const updatedLocation = { ...locationData, devices: updatedDevices };
      setLocationData(updatedLocation);
      await updateLocationFirestore(updatedLocation);
    }
  };

  const consumoTotal = devices.reduce((total, d) => {
    let kwhMes = 0;
    if (d.unidade === "kWh") {
      kwhMes = parseFloat(d.watts) * parseFloat(d.horas);
    } else {
      kwhMes = (parseFloat(d.watts) * parseFloat(d.horas) * 30) / 1000;
    }
    if (modoFixo) {
      const teTarifa = parseFloat((tarifas["fixo_te"] || "1").replace(",", "."));
      const tsudTarifa = parseFloat((tarifas["fixo_tsud"] || "1").replace(",", "."));
      return total + kwhMes * teTarifa * tsudTarifa;
    } else {
      const rangeKey = d.tipoTarifa.split("_").slice(0, 2).join("_");
      const teTarifa = parseFloat((tarifas[`${rangeKey}_te`] || "1").replace(",", "."));
      const tsudTarifa = parseFloat((tarifas[`${rangeKey}_tsud`] || "1").replace(",", "."));
      return total + kwhMes * teTarifa * tsudTarifa;
    }
  }, 0);

  const graficoConsumo = {
    labels: devices.map((d) => d.nome),
    datasets: [
      {
        label: "Consumo (kWh/mês)",
        data: devices.map((d) =>
          d.unidade === "kWh"
            ? parseFloat(d.watts) * parseFloat(d.horas)
            : (parseFloat(d.watts) * parseFloat(d.horas) * 30) / 1000
        ),
        backgroundColor: "#00BFFF",
      },
    ],
  };

  const graficoUso = {
    labels: devices.map((d) => d.nome),
    datasets: [
      {
        label: "Horas por dia",
        data: devices.map((d) => parseFloat(d.horas)),
        backgroundColor: [
          "#00BFFF",
          "#1E90FF",
          "#87CEFA",
          "#4682B4",
          "#5F9EA0",
        ],
      },
    ],
  };

  // Agrupa os dispositivos por cômodo (ou "Sem Cômodo")
  const devicesByRoom = devices.reduce((acc, device) => {
    const roomKey = device.roomId || "Sem Cômodo";
    if (!acc[roomKey]) acc[roomKey] = [];
    acc[roomKey].push(device);
    return acc;
  }, {} as { [key: string]: Eletronico[] });

  if (loading || !locationData)
    return (
      <div className="min-h-screen flex justify-center items-center text-white">
        Carregando...
      </div>
    );

  return (
    <div className="min-h-screen pt-[80px] bg-[#0D1117] text-white p-4 space-y-10">
      <Header nome={user?.displayName || user.email} />
      <div className="container mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-center mb-8"
        >
          Gerenciando Local: {locationData.name}
        </motion.h1>

        {/* Campo para gerenciar cômodos */}
        <div className="bg-[#161B22] p-6 rounded-2xl shadow-md mb-10">
          <h2 className="text-xl font-semibold text-[#00BFFF] mb-4">
            Cômodos
          </h2>
          <div className="flex flex-col gap-4">
            {rooms.map((room) => (
              <div key={room.id} className="p-3 bg-[#1E1E2F] rounded-xl">
                {room.name}
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-4">
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Novo cômodo"
              className="w-full p-3 rounded-xl bg-[#1E1E2F] text-white border border-white/20"
            />
            <button
              onClick={addRoom}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow-lg hover:shadow-blue-500/50 transition duration-300 ease-in-out"
            >
              Criar Cômodo
            </button>
          </div>
        </div>

        {/* Seletor de Modo */}
        <div className="bg-[#161B22] p-6 rounded-2xl shadow-md mb-6">
          <h2 className="text-xl mb-4 font-semibold text-[#00BFFF]">
            Selecione o Modo de Tarifação
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setModoFixo(false)}
              className={`px-4 py-2 rounded-xl font-semibold ${!modoFixo ? "bg-[#00BFFF] text-black" : "bg-gray-700"}`}
            >
              Por Faixa de Consumo
            </button>
            <button
              onClick={() => setModoFixo(true)}
              className={`px-4 py-2 rounded-xl font-semibold ${modoFixo ? "bg-[#00BFFF] text-black" : "bg-gray-700"}`}
            >
              Tarifa Fixa
            </button>
          </div>
        </div>

        {/* Cadastro de Tarifas */}
        <div className="bg-[#161B22] p-6 rounded-2xl shadow-md mb-10">
          <h2 className="text-xl mb-4 font-semibold text-[#00BFFF]">
            Cadastro de Tarifas
          </h2>
          {modoFixo ? (
            <div className="flex flex-col md:flex-row items-center gap-3 mb-3">
              <p className="w-full md:w-40">Tarifa Fixa</p>
              <input
                type="number"
                placeholder="TE (R$/kWh)"
                className="w-full p-3 rounded-xl bg-[#1E1E2F] text-white border border-white/20"
                value={tarifas["fixo_te"] || ""}
                onChange={(e) => handleTariffChange("fixo_te", e.target.value)}
              />
              <input
                type="number"
                placeholder="TSUD (R$/kWh)"
                className="w-full p-3 rounded-xl bg-[#1E1E2F] text-white border border-white/20"
                value={tarifas["fixo_tsud"] || ""}
                onChange={(e) => handleTariffChange("fixo_tsud", e.target.value)}
              />
            </div>
          ) : (
            <>
              {tiposCampos.map((tipo, i) => (
                <div
                  key={i}
                  className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mb-3"
                >
                  <select
                    value={tipo}
                    onChange={(e) => {
                      const novosCampos = [...tiposCampos];
                      novosCampos[i] = e.target.value;
                      setTiposCampos(novosCampos);
                    }}
                    className="w-full md:w-40 p-3 rounded-xl bg-[#1E1E2F] text-white border border-white/20"
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
                    onChange={(e) => handleTariffChange(tipo, e.target.value)}
                  />
                  <button
                    onClick={() => {
                      const novosCampos = [...tiposCampos];
                      novosCampos.splice(i, 1);
                      setTiposCampos(novosCampos);
                    }}
                    className="p-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setTiposCampos([...tiposCampos, "0_30_te"])}
                className="w-full px-4 py-2 mt-4 bg-blue-600 text-white rounded-xl shadow-lg hover:shadow-blue-500/50 transition duration-300 ease-in-out"
              >
                Adicionar Faixa
              </button>
            </>
          )}
          <button
            onClick={handleSalvarTarifas}
            className="w-full px-4 py-2 mt-4 bg-green-500 text-black rounded-xl hover:scale-105 transition"
          >
            Salvar Tarifas
          </button>
        </div>

        {/* Adicionar Aparelho */}
        <div className="bg-[#161B22] p-6 rounded-2xl shadow-md mb-10">
          <h2 className="text-xl font-semibold text-[#00BFFF]">
            Adicionar Aparelho
          </h2>
          <input
            className="w-full p-3 rounded-xl bg-[#1E1E2F] text-white mb-3"
            placeholder="Nome do Aparelho"
            value={novo.nome}
            onChange={(e) => setNovo({ ...novo, nome: e.target.value })}
          />
          {/* Campo para selecionar o cômodo */}
          <select
            value={novo.roomId || ""}
            onChange={(e) => setNovo({ ...novo, roomId: e.target.value })}
            className="w-full p-3 rounded-xl bg-[#1E1E2F] text-white border border-white/20 mb-3"
          >
            <option value="">Selecione o cômodo</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>
          {novo.unidade === "V" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
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
              className="w-full p-3 rounded-xl bg-[#1E1E2F] text-white mb-3"
              placeholder={novo.unidade === "kWh" ? "Consumo (kWh)" : "Potência (ex: 1000)"}
              type="number"
              value={novo.valor}
              onChange={(e) => setNovo({ ...novo, valor: e.target.value })}
            />
          )}
          <div className="flex gap-4 mb-3">
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
            onClick={handleAddDevice}
            className="w-full px-6 py-3 bg-[#00BFFF] text-black rounded-2xl font-semibold shadow hover:scale-105 transition"
          >
            Adicionar Aparelho
          </button>
        </div>

        {/* Lista de Aparelhos agrupados por cômodo */}
        <div className="bg-[#161B22] p-6 rounded-2xl shadow-md mb-10">
          <h2 className="text-xl font-semibold text-[#00BFFF]">Seus Aparelhos</h2>
          {Object.entries(
            devices.reduce((acc, device) => {
              const key = device.roomId || "Sem Cômodo";
              if (!acc[key]) acc[key] = [];
              acc[key].push(device);
              return acc;
            }, {} as { [key: string]: Eletronico[] })
          ).map(([roomId, devicesGroup]) => {
            const roomName =
              roomId === "Sem Cômodo"
                ? "Sem Cômodo"
                : rooms.find((r) => r.id === roomId)?.name || "Cômodo";
            return (
              <div key={roomId} className="mb-6">
                <h3 className="text-lg font-bold mb-3">{roomName}</h3>
                {devicesGroup.map((el) => {
                  let kwhMes = 0;
                  if (el.unidade === "kWh") {
                    kwhMes = parseFloat(el.watts) * parseFloat(el.horas);
                  } else {
                    kwhMes =
                      (parseFloat(el.watts) * parseFloat(el.horas) * 30) / 1000;
                  }
                  let custo = 0;
                  if (modoFixo) {
                    const teTarifa = parseFloat(
                      (tarifas["fixo_te"] || "1").replace(",", ".")
                    );
                    const tsudTarifa = parseFloat(
                      (tarifas["fixo_tsud"] || "1").replace(",", ".")
                    );
                    custo = kwhMes * teTarifa * tsudTarifa;
                  } else {
                    const rangeKey = el.tipoTarifa.split("_").slice(0, 2).join("_");
                    const teTarifa = parseFloat(
                      (tarifas[`${rangeKey}_te`] || "1").replace(",", ".")
                    );
                    const tsudTarifa = parseFloat(
                      (tarifas[`${rangeKey}_tsud`] || "1").replace(",", ".")
                    );
                    custo = kwhMes * teTarifa * tsudTarifa;
                  }
                  return (
                    <div
                      key={el.id}
                      className="flex items-center gap-4 bg-[#1E1E2F] p-4 rounded-xl mb-3"
                    >
                      <div className="flex-1">
                        <p className="text-lg font-bold">{el.nome}</p>
                        <p className="text-sm text-gray-300">
                          {el.watts}{el.unidade} - {modoFixo ? "Tarifa Fixa" : el.tipoTarifa} -{" "}
                          {kwhMes.toFixed(2)} kWh/mês - R$ {custo.toFixed(2)}
                        </p>
                      </div>
                      <input
                        type="number"
                        className="w-24 p-2 rounded bg-[#111827] text-white"
                        value={el.horas}
                        onChange={(e) => handleEditHoras(el.id, e.target.value)}
                      />
                      <button
                        onClick={() => handleRemoveDevice(el.id)}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
                      >
                        Remover
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Resultado Total e Gráficos */}
        <div className="text-lg bg-[#161B22] p-6 rounded-xl mb-10">
          <p className="mb-2">
            Custo total estimado:
            <span className="text-[#00BFFF] font-bold">
              {" "}
              R$ {consumoTotal.toFixed(2)}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-[#161B22] p-6 rounded-xl shadow-lg">
            <h3 className="text-lg mb-4 font-semibold text-[#00BFFF]">
              Consumo por Aparelho
            </h3>
            <Bar data={graficoConsumo} options={{ responsive: true }} />
          </div>
          <div className="bg-[#161B22] p-6 rounded-xl shadow-lg">
            <h3 className="text-lg mb-4 font-semibold text-[#00BFFF]">
              Tempo de Uso por Aparelho
            </h3>
            <Pie data={graficoUso} options={{ responsive: true }} />
          </div>
        </div>
      </div>
    </div>
  );
}
