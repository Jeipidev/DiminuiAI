"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../firebase";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  FiTarget,
  FiAward,
  FiDollarSign,
  FiBookOpen,
  FiHome,
  FiZap,
  FiPlus,
  FiSettings,
  FiTrendingUp,
  FiBarChart,
} from "react-icons/fi";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { Bar } from "react-chartjs-2";
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

interface Device {
  id: string;
  name: string;
  wattage: number;
  unidade: string;
  watts: string;
  horas: string;
}

interface Room {
  id: string;
  name: string;
  devices: Device[];
}

interface Tarifas {
  id: string;
  te: number;
  tusd: number;
}

interface Location {
  id: string;
  name: string;
  rooms: Room[];
  devices: Device[];
  tarifas: Tarifas[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [newLocationName, setNewLocationName] = useState("");

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
          setLocations(data.locations || []);
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  const addLocation = async () => {
    if (newLocationName.trim() === "") return;
    const newLoc: Location = {
      id: Math.random().toString(36).substr(2, 9),
      name: newLocationName,
      rooms: [],
      devices: [],
      tarifas: [],
    };
    const updatedLocations = [...locations, newLoc];
    setLocations(updatedLocations);
    setNewLocationName("");
    if (user) {
      const userRef = doc(db, "usuarios", user.uid);
      await setDoc(userRef, { locations: updatedLocations }, { merge: true });
    }
  };

  return (
    <div className="min-h-screen pt-[80px] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 space-y-8">
      <Header nome={user?.displayName || user?.email || "Usuário"} />
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Bem-vindo, {user?.displayName || user?.email?.split('@')[0]}
          </h1>
          <p className="text-slate-400 text-lg">Gerencie sua energia de forma inteligente</p>
        </motion.div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <FiHome className="text-blue-400 text-2xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{locations.length}</p>
                <p className="text-slate-400 text-sm">Locais</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <FiZap className="text-green-400 text-2xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {locations.reduce((acc, loc) => acc + (loc.devices?.length || 0), 0)}
                </p>
                <p className="text-slate-400 text-sm">Aparelhos</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <FiSettings className="text-purple-400 text-2xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {locations.reduce((acc, loc) => acc + (loc.rooms?.length || 0), 0)}
                </p>
                <p className="text-slate-400 text-sm">Cômodos</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-500/20 rounded-xl">
                <FiTrendingUp className="text-yellow-400 text-2xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {locations.reduce((acc, loc) => acc + Object.keys(loc.tarifas || {}).length, 0)}
                </p>
                <p className="text-slate-400 text-sm">Tarifas</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Seus Locais */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/20 rounded-xl">
              <FiHome className="text-blue-400 text-xl" />
            </div>
            <h2 className="text-2xl font-semibold text-white">Seus Locais</h2>
          </div>

          {locations.length === 0 ? (
            <div className="text-center py-12">
              <FiHome className="mx-auto text-6xl text-slate-600 mb-4" />
              <p className="text-slate-400 text-lg mb-2">Nenhum local cadastrado ainda</p>
              <p className="text-slate-500">Adicione seu primeiro local para começar</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {locations.map((loc) => (
                <LocationCard key={loc.id} location={loc} />
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={newLocationName}
              onChange={(e) => setNewLocationName(e.target.value)}
              placeholder="Nome do novo local"
              className="flex-1 p-4 rounded-2xl bg-white/10 backdrop-blur-sm text-white border border-white/20 placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all"
            />
            <button
              onClick={addLocation}
              className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              <FiPlus /> Adicionar Local
            </button>
          </div>
        </motion.div>

        {/* Navegação Rápida */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/20 rounded-xl">
              <FiSettings className="text-purple-400 text-xl" />
            </div>
            <h2 className="text-2xl font-semibold text-white">Acesso Rápido</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <FiTarget />, label: "Metas", link: "/metas", color: "from-red-500 to-pink-500" },
              { icon: <FiAward />, label: "Conquistas", link: "/perfil", color: "from-yellow-500 to-orange-500" },
              { icon: <FiDollarSign />, label: "Contas", link: "/contas", color: "from-green-500 to-emerald-500" },
              { icon: <FiBookOpen />, label: "Tutorial", link: "/dashboard/tutorial", color: "from-blue-500 to-cyan-500" },
            ].map((btn, index) => (
              <Link href={btn.link} key={index}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`flex flex-col items-center justify-center p-6 bg-gradient-to-br ${btn.color} bg-opacity-20 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 group`}
                >
                  <div className="mb-3 text-3xl group-hover:scale-110 transition-transform duration-300">
                    {btn.icon}
                  </div>
                  <span className="text-sm font-medium text-white">{btn.label}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Comparação Entre Locais */}
        {locations.length > 0 && (
          <ComparisonCharts locations={locations} />
        )}
      </div>
    </div>
  );
}

interface LocationCardProps {
  location: Location;
}
function LocationCard({ location }: LocationCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white/10 backdrop-blur-sm border border-white/10 p-6 rounded-2xl hover:bg-white/15 transition-all duration-300 group"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors">
          <FiHome className="text-blue-400 text-xl" />
        </div>
        <h3 className="text-xl font-bold text-white">{location.name}</h3>
      </div>
      
      <div className="space-y-2 mb-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400 flex items-center gap-2">
            <FiZap className="text-xs" />
            Aparelhos
          </span>
          <span className="text-white font-medium">{location.devices?.length || 0}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400 flex items-center gap-2">
            <FiSettings className="text-xs" />
            Cômodos
          </span>
          <span className="text-white font-medium">{location.rooms?.length || 0}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400 flex items-center gap-2">
            <FiDollarSign className="text-xs" />
            Tarifas
          </span>
          <span className="text-white font-medium">{Object.keys(location.tarifas || {}).length}</span>
        </div>
      </div>
      
      <Link href={`/dashboard/locations/${location.id}`}>
        <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105">
          Gerenciar Local
        </button>
      </Link>
    </motion.div>
  );
}

interface ComparisonChartsProps {
  locations: Location[];
}

function ComparisonCharts({ locations }: ComparisonChartsProps) {
  const getLocationConsumption = (loc: Location) => {
    return loc.devices?.reduce((acc, d) => {
      let consumo = 0;
      if (d.unidade === "kWh") {
        consumo = parseFloat(d.watts) * parseFloat(d.horas);
      } else {
        consumo = (parseFloat(d.watts) * parseFloat(d.horas) * 30) / 1000;
      }
      return acc + consumo;
    }, 0) || 0;
  };

  const labels = locations.map(loc => loc.name);
  const devicesData = locations.map(loc => loc.devices?.length || 0);
  const consumptionData = locations.map(loc => getLocationConsumption(loc));

  const barDevicesData = {
    labels,
    datasets: [
      {
        label: "Número de Aparelhos",
        data: devicesData,
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 2,
        borderRadius: 8,
      }
    ]
  };

  const barConsumptionData = {
    labels,
    datasets: [
      {
        label: "Consumo Total (kWh/mês)",
        data: consumptionData,
        backgroundColor: "rgba(34, 197, 94, 0.8)",
        borderColor: "rgb(34, 197, 94)",
        borderWidth: 2,
        borderRadius: 8,
      }
    ]
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-500/20 rounded-xl">
          <FiBarChart className="text-green-400 text-xl" />
        </div>
        <h2 className="text-2xl font-semibold text-white">Comparação Entre Locais</h2>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold text-blue-400 mb-4 text-center">
            Número de Aparelhos por Local
          </h3>
          <div className="h-80">
            <Bar 
              data={barDevicesData} 
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
          <h3 className="text-xl font-semibold text-green-400 mb-4 text-center">
            Consumo Total por Local (kWh/mês)
          </h3>
          <div className="h-80">
            <Bar 
              data={barConsumptionData} 
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
  );
}