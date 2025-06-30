"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../../../firebase";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import Link from "next/link";
import { FiTrash2, FiPlus, FiHome, FiDollarSign, FiClock, FiZap, FiChevronDown } from "react-icons/fi";
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

interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  color?: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Selecione uma opção",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const selectedOption = options.find(option => option.value === value);

  return (
    <div className={`relative ${className}`}>
      {/* Select Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 rounded-2xl bg-white/10 backdrop-blur-sm text-white border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all duration-300 hover:bg-white/15 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          {selectedOption?.icon && (
            <span className={selectedOption.color || "text-white"}>
              {selectedOption.icon}
            </span>
          )}
          <div className="text-left">
            <div className="font-medium">
              {selectedOption ? selectedOption.label : placeholder}
            </div>
            {selectedOption?.description && (
              <div className="text-sm text-slate-400">
                {selectedOption.description}
              </div>
            )}
          </div>
        </div>
        <FiChevronDown 
          className={`text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-slate-800/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
          <div className="max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full p-4 text-left hover:bg-white/10 transition-all duration-200 flex items-center gap-3 border-b border-white/5 last:border-b-0 ${
                  value === option.value ? 'bg-blue-500/20 border-blue-500/30' : ''
                }`}
              >
                {option.icon && (
                  <span className={option.color || "text-white"}>
                    {option.icon}
                  </span>
                )}
                <div className="flex-1">
                  <div className={`font-medium ${option.color || "text-white"}`}>
                    {option.label}
                  </div>
                  {option.description && (
                    <div className="text-sm text-slate-400 mt-1">
                      {option.description}
                    </div>
                  )}
                </div>
                {value === option.value && (
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

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
  tarifas: { [key: string]: string }; // Ex.: { "0_30_te": "0.5", "0_30_tusd": "0.2", ... }
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
  // Estado para o formulário de novo dispositivo (sem voltagem)
  const [novo, setNovo] = useState({
    nome: "",
    valor: "",
    unidade: "W",
    horas: "",
    roomId: "",
  });

  // Opções para os selects customizados
  const unitOptions: SelectOption[] = [
    { 
      value: "W", 
      label: "Watts (W)", 
      description: "Potência em Watts", 
      icon: <FiZap />,
      color: "text-blue-400"
    },
    { 
      value: "kWh", 
      label: "kWh por mês", 
      description: "Consumo mensal", 
      icon: <FiDollarSign />,
      color: "text-green-400"
    },
    { 
      value: "kWh/ano", 
      label: "kWh por ano", 
      description: "Consumo anual", 
      icon: <FiDollarSign />,
      color: "text-purple-400"
    }
  ];

  const tariffOptions: SelectOption[] = [
    { 
      value: "0_30_te", 
      label: "0-30 kWh (TE)", 
      description: "Tarifa de Energia - Faixa 1", 
      color: "text-green-400" 
    },
    { 
      value: "0_30_tusd", 
      label: "0-30 kWh (TUSD)", 
      description: "Tarifa de Uso - Faixa 1", 
      color: "text-blue-400" 
    },
    { 
      value: "30_100_te", 
      label: "30-100 kWh (TE)", 
      description: "Tarifa de Energia - Faixa 2", 
      color: "text-yellow-400" 
    },
    { 
      value: "30_100_tusd", 
      label: "30-100 kWh (TUSD)", 
      description: "Tarifa de Uso - Faixa 2", 
      color: "text-orange-400" 
    },
    { 
      value: "100_220_te", 
      label: "100-220 kWh (TE)", 
      description: "Tarifa de Energia - Faixa 3", 
      color: "text-red-400" 
    },
    { 
      value: "100_220_tusd", 
      label: "100-220 kWh (TUSD)", 
      description: "Tarifa de Uso - Faixa 3", 
      color: "text-purple-400" 
    }
  ];

  // ===== FUNÇÕES DE CÁLCULO UNIFICADAS =====
  
  // Função unificada para calcular consumo mensal em kWh
  const calcularConsumoMensal = (device: Eletronico): number => {
    const valor = parseFloat(device.watts);
    const horas = parseFloat(device.horas);
    
    if (isNaN(valor) || isNaN(horas)) return 0;
    
    switch (device.unidade) {
      case "W":
        // Watts para kWh/mês: (W * horas/dia * 30 dias) / 1000
        return (valor * horas * 30) / 1000;
      case "kWh":
        // kWh/mês multiplicado pelas horas de uso
        return valor * horas;
      case "kWh/ano":
        // kWh/ano dividido por 12 meses, multiplicado pelas horas de uso
        return (valor / 12) * horas;
      default:
        return 0;
    }
  };

  // Função unificada para calcular custo
  const calcularCusto = (consumoMensal: number, tipoTarifa: string): number => {
    if (modoFixo) {
      const teTarifa = parseFloat((tarifas["fixo_te"] || "0").replace(",", "."));
      const tusdTarifa = parseFloat((tarifas["fixo_tusd"] || "0").replace(",", "."));
      // Tarifa fixa: TE + TUSD (não multiplicados)
      return consumoMensal * (teTarifa * tusdTarifa);
    } else {
      // Identificar qual faixa usar baseado no consumo
      const faixa = identificarFaixaPorConsumo(consumoMensal);
      const teTarifa = parseFloat((tarifas[`${faixa}_te`] || "0").replace(",", "."));
      const tusdTarifa = parseFloat((tarifas[`${faixa}_tusd`] || "0").replace(",", "."));
      // Por faixa: TE + TUSD (não multiplicados)
      return consumoMensal * (teTarifa *+ tusdTarifa);
    }
  };

  // Função para identificar a faixa baseada no consumo mensal
  const identificarFaixaPorConsumo = (consumoMensal: number): string => {
    if (consumoMensal <= 30) return "0_30";
    if (consumoMensal <= 100) return "30_100";
    return "100_220";
  };

  // ===== FIM DAS FUNÇÕES DE CÁLCULO UNIFICADAS =====

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

  const handleAddDevice = async () => {
    if (!novo.nome || !novo.horas || !user || !locationData) return;
    
    const valorConvertido = parseFloat(novo.valor);
    
    // Para determinar o tipo de tarifa inicial, calculamos o consumo mensal
    const deviceTemp: Eletronico = {
      id: "",
      nome: novo.nome,
      watts: valorConvertido.toFixed(2),
      horas: novo.horas,
      unidade: novo.unidade,
      tipoTarifa: "",
      roomId: novo.roomId,
    };
    
    const consumoMensal = calcularConsumoMensal(deviceTemp);
    const tipoTarifa = modoFixo ? "fixo" : identificarFaixaPorConsumo(consumoMensal);
    
    const newDevice: Eletronico = {
      id: Math.random().toString(36).substr(2, 9),
      nome: novo.nome,
      watts: valorConvertido.toFixed(2),
      horas: novo.horas,
      unidade: novo.unidade,
      tipoTarifa,
      roomId: novo.roomId,
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
      const updatedLocation = { ...locationData, tarifas: updatedTarifas };
      setLocationData(updatedLocation);
      await updateLocationFirestore(updatedLocation);
    }
  };

  const handleEditHoras = async (deviceId: string, novasHoras: string) => {
    const updatedDevices = devices.map((d) => {
      if (d.id === deviceId) {
        const updatedDevice = { ...d, horas: novasHoras };
        // Recalcular tipo de tarifa se não for modo fixo
        if (!modoFixo) {
          const consumoMensal = calcularConsumoMensal(updatedDevice);
          updatedDevice.tipoTarifa = identificarFaixaPorConsumo(consumoMensal);
        }
        return updatedDevice;
      }
      return d;
    });
    setDevices(updatedDevices);
    if (locationData) {
      const updatedLocation = { ...locationData, devices: updatedDevices };
      setLocationData(updatedLocation);
      await updateLocationFirestore(updatedLocation);
    }
  };

  // Cálculo do consumo total usando as funções unificadas
  const consumoTotal = devices.reduce((total, device) => {
    const consumoMensal = calcularConsumoMensal(device);
    const custo = calcularCusto(consumoMensal, device.tipoTarifa);
    return total + custo;
  }, 0);

  // Gráfico de gasto em dinheiro por aparelho (usando funções unificadas)
  const graficoGasto = {
    labels: devices.map((d) => d.nome),
    datasets: [
      {
        label: "Gasto Mensal (R$)",
        data: devices.map((device) => {
          const consumoMensal = calcularConsumoMensal(device);
          return calcularCusto(consumoMensal, device.tipoTarifa);
        }),
        backgroundColor: "rgba(34, 197, 94, 0.8)",
        borderColor: "rgb(34, 197, 94)",
        borderWidth: 2,
        borderRadius: 8,
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
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(245, 101, 101, 0.8)",
          "rgba(251, 191, 36, 0.8)",
          "rgba(139, 92, 246, 0.8)",
        ],
        borderWidth: 0,
      },
    ],
  };

  if (loading || !locationData)
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen pt-[80px] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 space-y-8">
      <Header nome={user?.displayName || user.email} />
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            {locationData.name}
          </h1>
          <p className="text-slate-400 text-lg">Gerenciamento Inteligente de Energia</p>
        </motion.div>
        <motion.div
        initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/20 rounded-xl">
              <FiZap className="text-blue-400 text-xl" />
            </div>
            <h2 className="text-2xl font-semibold text-white">Cômodos</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {rooms.map((room) => (
              <div key={room.id} className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/15 transition-all duration-300">
                <p className="text-white font-medium">{room.name}</p>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Nome do novo cômodo"
              className="flex-1 p-4 rounded-2xl bg-white/10 backdrop-blur-sm text-white border border-white/20 placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all"
            />
            <button
              onClick={addRoom}
              className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              <FiPlus /> Adicionar Cômodo
            </button>
          </div>
        </motion.div>

        

        {/* Seletor de Modo - Modernizado */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-500/20 rounded-xl">
              <FiDollarSign className="text-green-400 text-xl" />
            </div>
            <h2 className="text-2xl font-semibold text-white">Modo de Tarifação</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setModoFixo(false)}
              className={`flex-1 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                !modoFixo 
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg" 
                  : "bg-white/10 text-slate-300 hover:bg-white/15"
              }`}
            >
              Por Faixa de Consumo
            </button>
            <button
              onClick={() => setModoFixo(true)}
              className={`flex-1 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                modoFixo 
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg" 
                  : "bg-white/10 text-slate-300 hover:bg-white/15"
              }`}
            >
              Tarifa Fixa
            </button>
          </div>
        </motion.div>

        {/* Cadastro de Tarifas - Modernizado */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-500/20 rounded-xl">
              <FiDollarSign className="text-yellow-400 text-xl" />
            </div>
            <h2 className="text-2xl font-semibold text-white">Configuração de Tarifas</h2>
          </div>
          
          {modoFixo ? (
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 mb-4">
              <div className="lg:w-48 flex items-center">
                <p className="text-white font-medium">Tarifa Fixa</p>
              </div>
              <input
                type="number"
                placeholder="TE (R$/kWh)"
                className="flex-1 p-4 rounded-2xl bg-white/10 backdrop-blur-sm text-white border border-white/20 placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all"
                value={tarifas["fixo_te"] || ""}
                onChange={(e) => handleTariffChange("fixo_te", e.target.value)}
              />
              <input
                type="number"
                placeholder="TUSD (R$/kWh)"
                className="flex-1 p-4 rounded-2xl bg-white/10 backdrop-blur-sm text-white border border-white/20 placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all"
                value={tarifas["fixo_tusd"] || ""}
                onChange={(e) => handleTariffChange("fixo_tusd", e.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-4 mb-6">
              {tiposCampos.map((tipo, i) => (
                <div key={i} className="flex z-50 flex-col lg:flex-row items-stretch lg:items-center gap-4">
                  <CustomSelect
                    options={tariffOptions}
                    value={tipo}
                    onChange={(value) => {
                      const novosCampos = [...tiposCampos];
                      novosCampos[i] = value;
                      setTiposCampos(novosCampos);
                    }}
                    placeholder="Selecione o tipo de tarifa"
                    className="lg:w-72"
                  />
                  <input
                    type="number"
                    placeholder="Valor R$/kWh"
                    className="flex-1 p-4 rounded-2xl bg-white/10 backdrop-blur-sm text-white border border-white/20 placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all"
                    value={tarifas[tipo] || ""}
                    onChange={(e) => handleTariffChange(tipo, e.target.value)}
                  />
                  <button
                    onClick={() => {
                      const novosCampos = [...tiposCampos];
                      novosCampos.splice(i, 1);
                      setTiposCampos(novosCampos);
                    }}
                    className="p-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-2xl transition-all duration-300"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setTiposCampos([...tiposCampos, "0_30_te"])}
                className="w-full px-6 py-4 bg-white/10 hover:bg-white/15 text-white rounded-2xl border border-white/20 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <FiPlus /> Adicionar Faixa
              </button>
            </div>
          )}
          
          <button
            onClick={handleSalvarTarifas}
            className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-green-500/25 transition-all duration-300 hover:scale-105"
          >
            Salvar Configurações
          </button>
        </motion.div>

        {/* Adicionar Aparelho - Modernizado */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 z-50 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/20 rounded-xl">
              <FiZap className="text-purple-400 text-xl" />
            </div>
            <h2 className="text-2xl font-semibold text-white">Adicionar Aparelho</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <input className=" p-4 rounded-2xl bg-white/10 backdrop-blur-sm text-white border border-white/20 placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all"
              placeholder="Nome do Aparelho"
              value={novo.nome}
              onChange={(e) => setNovo({ ...novo, nome: e.target.value })}
            />
            
            <select
              value={novo.roomId || ""}
              onChange={(e) => setNovo({ ...novo, roomId: e.target.value })}
              className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm text-white border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all"
            >
              <option value="">Selecione o cômodo</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id} className="bg-slate-800 text-white">
                  {room.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Campo para valor baseado na unidade selecionada */}
          <input
            className="w-full p-4 rounded-2xl bg-white/10 backdrop-blur-sm text-white border border-white/20 placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all mt-4"
            placeholder={
              novo.unidade === "kWh" 
                ? "Consumo mensal (kWh)" 
                : novo.unidade === "kWh/ano"
                ? "Consumo anual (kWh/ano)"
                : "Potência (ex: 1000)"
            }
            type="number"
            value={novo.valor}
            onChange={(e) => setNovo({ ...novo, valor: e.target.value })}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <select
              value={novo.unidade || ""}
              onChange={(e) => setNovo({ ...novo, unidade: e.target.value })}
              className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm text-white border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all"
            >
              <option value="">Selecione o cômodo</option>
              {unitOptions.map((unidade) => (
                <option key={unidade.value} value={unidade.value} className="bg-slate-800 text-white">
                  {unidade.value}
                </option>
              ))}
            </select>
              
            <input
              className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm text-white border border-white/20 placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all"
              placeholder="Horas/dia"
              type="number"
              value={novo.horas}
              onChange={(e) => setNovo({ ...novo, horas: e.target.value })}
            />
          </div>
          
          <button
            onClick={handleAddDevice}
            className="w-full px-6 py-4 mt-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
          >
            <FiPlus /> Adicionar Aparelho
          </button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/20 rounded-xl">
              <FiHome className="text-blue-400 text-xl" />
            </div>
            <h2 className="text-2xl font-semibold text-white">Seus Aparelhos</h2>
          </div>
          
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
              <div key={roomId} className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-500/20 rounded-xl">
                    <FiHome className="text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{roomName}</h3>
                </div>
                
                <div className="space-y-3">
                  {devicesGroup.map((el) => {
                    const consumoMensal = calcularConsumoMensal(el);
                    const custo = calcularCusto(consumoMensal, el.tipoTarifa);
                    
                    return (
                      <div
                        key={el.id}
                        className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:bg-white/15 transition-all duration-300"
                      >
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-white mb-2">{el.nome}</h4>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <span className="flex items-center gap-1 text-blue-400">
                              <FiZap className="text-xs" />
                              {el.watts} {el.unidade}
                            </span>
                            <span className="flex items-center gap-1 text-green-400">
                              <FiDollarSign className="text-xs" />
                              {modoFixo ? "Tarifa Fixa" : `Faixa ${el.tipoTarifa}`}
                            </span>
                            <span className="text-yellow-400">
                              {consumoMensal.toFixed(2)} kWh/mês
                            </span>
                            <span className="text-emerald-400 font-semibold">
                              R$ {custo.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <FiClock className="text-slate-400" />
                            <input
                              type="number"
                              className="w-20 p-2 rounded-xl bg-white/10 backdrop-blur-sm text-white border border-white/20 text-center focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all"
                              value={el.horas}
                              onChange={(e) => handleEditHoras(el.id, e.target.value)}
                            />
                            <span className="text-slate-400 text-sm">h/dia</span>
                          </div>
                          
                          <button
                            onClick={() => handleRemoveDevice(el.id)}
                            className="p-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-all duration-300 hover:scale-105"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </motion.div>
        {/* Resultado Total - Modernizado */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 backdrop-blur-xl border border-emerald-500/30 p-8 rounded-3xl shadow-2xl mb-8"
        >
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <FiDollarSign className="text-emerald-400 text-2xl" />
              </div>
              <h2 className="text-2xl font-semibold text-white">Custo Total Estimado</h2>
            </div>
            <p className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
              R$ {consumoTotal.toFixed(2)}
            </p>
            <p className="text-slate-400 mt-2">Por mês</p>
          </div>
        </motion.div>

        {/* Gráficos - Modernizados */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-500/20 rounded-xl">
                <FiDollarSign className="text-green-400 text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-white">Gasto por Aparelho</h3>
            </div>
            <div className="h-80">
              <Bar 
                data={graficoGasto} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      labels: {
                        color: 'white'
                      }
                    }
                  },
                  scales: {
                    x: {
                      ticks: {
                        color: 'white'
                      },
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      }
                    },
                    y: {
                      ticks: {
                        color: 'white'
                      },
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      }
                    }
                  }
                }} 
              />
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/20 rounded-xl">
                <FiClock className="text-blue-400 text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-white">Tempo de Uso por Aparelho</h3>
            </div>
            <div className="h-80">
              <Pie 
                data={graficoUso} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      labels: {
                        color: 'white'
                      }
                    }
                  }
                }} 
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
