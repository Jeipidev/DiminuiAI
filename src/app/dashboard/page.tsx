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
  unidade: string; // e.g., "kWh" or other units
  watts: string; // power consumption in watts
  horas: string; // hours of usage per day
}

interface Room {
  id: string;
  name: string;
  devices: Device[];
}

interface Tarifas {
  id: string;
  te: number;
  tsud: number;
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
    <div className="min-h-screen bg-[#0D1117] text-white p-4">
      <Header nome={user?.displayName || user?.email || "Usuário"} />
      <div className="container mx-auto mt-20">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-center mb-8"
        >
          Bem-vindo, {user?.displayName || user?.email}
        </motion.h1>

        <LocationList
          locations={locations}
          newLocationName={newLocationName}
          setNewLocationName={setNewLocationName}
          addLocation={addLocation}
        />

        <NavigationButtons />

        {/* Nova Seção: Comparação de Consumo entre Locais */}
        <ComparisonCharts locations={locations} />
      </div>
    </div>
  );
}

interface LocationListProps {
  locations: Location[];
  newLocationName: string;
  setNewLocationName: (name: string) => void;
  addLocation: () => void;
}
function LocationList({
  locations,
  newLocationName,
  setNewLocationName,
  addLocation,
}: LocationListProps) {
  return (
    <div className="mb-10">
      <h2 className="text-2xl font-semibold mb-4">Seus Locais</h2>
      <div className="flex flex-col gap-4">
        {locations.map((loc) => (
          <LocationCard key={loc.id} location={loc} />
        ))}
      </div>
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={newLocationName}
          onChange={(e) => setNewLocationName(e.target.value)}
          placeholder="Nome do novo local"
          className="w-full p-3 rounded-xl bg-[#1E1E2F] text-white border border-white/20"
        />
        <button
          onClick={addLocation}
          className="w-full sm:w-auto px-6 py-3 bg-[#00BFFF] text-black font-semibold rounded-xl hover:scale-105 transition"
        >
          Adicionar Local
        </button>
      </div>
    </div>
  );
}

interface LocationCardProps {
  location: Location;
}
function LocationCard({ location }: LocationCardProps) {
  return (
    <div className="p-4 bg-[#161B22] rounded-xl shadow-md">
      <h3 className="text-xl font-bold">{location.name}</h3>
      <div className="mt-2">
        <p className="text-sm text-gray-400">
          Aparelhos: {location.devices.length} | Tarifas: {Object.keys(location.tarifas || {}).length} | Cômodos: {location.rooms.length}
        </p>
      </div>
      <div className="mt-4">
        <Link href={`/dashboard/locations/${location.id}`}>
          <button className="px-4 py-2 bg-[#00BFFF] text-black rounded-xl hover:scale-105 transition">
            Gerenciar Local
          </button>
        </Link>
      </div>
    </div>
  );
}

function NavigationButtons() {
  const buttons = [
    { icon: <FiTarget />, label: "Metas", link: "/metas" },
    { icon: <FiAward />, label: "Conquistas", link: "/perfil" },
    { icon: <FiDollarSign />, label: "Contas", link: "/contas" },
    { icon: <FiBookOpen />, label: "Tutorial", link: "/dashboard/tutorial" },
  ];

  return (
    <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
      {buttons.map((btn, index) => (
        <Link href={btn.link} key={index}>
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="flex flex-col items-center justify-center p-4 bg-[#161B22] rounded-xl shadow-lg transition hover:shadow-xl"
          >
            <div className="mb-2 text-2xl">{btn.icon}</div>
            <span className="text-sm">{btn.label}</span>
          </motion.div>
        </Link>
      ))}
    </div>
  );
}

interface ComparisonChartsProps {
  locations: Location[];
}

function ComparisonCharts({ locations }: ComparisonChartsProps) {
  // Gráfico de barras: Número de aparelhos por local (já existente)
  const labels = locations.map(loc => loc.name);
  const devicesData = locations.map(loc => loc.devices.length);
  const barDevicesData = {
    labels,
    datasets: [
      {
        label: "Número de Aparelhos",
        data: devicesData,
        backgroundColor: "#00BFFF"
      }
    ]
  };

  // Novo gráfico: Consumo total por local (em kWh/mês)
  // Para cada local, somamos o consumo de todos os dispositivos.
  const getLocationConsumption = (loc: Location) => {
    return loc.devices.reduce((acc, d) => {
      let consumo = 0;
      if (d.unidade === "kWh") {
        consumo = parseFloat(d.watts) * parseFloat(d.horas);
      } else {
        consumo = (parseFloat(d.watts) * parseFloat(d.horas) * 30) / 1000;
      }
      return acc + consumo;
    }, 0);
  };

  const consumptionData = locations.map(loc => getLocationConsumption(loc));
  const barConsumptionData = {
    labels,
    datasets: [
      {
        label: "Consumo Total (kWh/mês)",
        data: consumptionData,
        backgroundColor: "#1E90FF"
      }
    ]
  };

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-semibold mb-6 text-center">Comparação Entre Locais</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-[#161B22] p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-[#00BFFF] mb-4 text-center">
            Número de Aparelhos por Local
          </h3>
          <Bar data={barDevicesData} options={{ responsive: true }} />
        </div>
        <div className="bg-[#161B22] p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-[#00BFFF] mb-4 text-center">
            Custo Total por Local (kWh/mês)
          </h3>
          <Bar data={barConsumptionData} options={{ responsive: true }} />
        </div>
      </div>
    </div>
  );
}

