"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { auth } from "../../../../firebase";
import {
  FiHome,
  FiZap,
  FiDollarSign,
  FiTarget,
  FiAward,
  FiBookOpen,
  FiArrowRight,
  FiArrowLeft,
  FiPlay,
  FiPause,
  FiSettings,
  FiPlus,
  FiCheckCircle,
  FiTrendingUp,
  FiBarChart,
  FiCalendar,
  FiClock,
  FiInfo,
  FiCloudLightning,
  FiStar,
} from "react-icons/fi";
import Header from "@/components/Header";
import { BiLeaf } from "react-icons/bi";

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  component: React.ReactNode;
  tips: string[];
}

export default function TutorialPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
   const [user, setUser] = useState<any>(null);

   useEffect(() => {
       const unsubscribe = onAuthStateChanged(auth, async (u) => {
         if (!u) {
           router.push("/login");
         } else {
           setUser(u);
         }
       });
       return () => unsubscribe();
     }, [router]);

  // Auto-play tutorial
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % tutorialSteps.length);
      }, 8000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const tutorialSteps: TutorialStep[] = [
    {
      id: 0,
      title: "Bem-vindo ao EcoTracker!",
      description: "Aprenda a usar todas as funcionalidades da nossa plataforma de gestão de energia de forma inteligente e eficiente.",
      component: <WelcomeComponent />,
      tips: [
        "Use o menu lateral para navegar entre as páginas",
        "Todas as informações são salvas automaticamente",
        "Você pode acessar este tutorial a qualquer momento"
      ]
    },
    {
      id: 1,
      title: "Criando Seus Locais",
      description: "O primeiro passo é criar os locais onde você quer monitorar o consumo de energia, como casa, escritório, loja, etc.",
      component: <LocationTutorial />,
      tips: [
        "Você pode ter quantos locais quiser",
        "Cada local tem suas próprias tarifas e configurações",
        "Use nomes descritivos como 'Casa Principal' ou 'Escritório Centro'"
      ]
    },
    {
      id: 2,
      title: "Organizando por Cômodos",
      description: "Organize seus aparelhos por cômodos para ter um controle mais detalhado do consumo em cada ambiente.",
      component: <RoomTutorial />,
      tips: [
        "Cômodos ajudam a identificar onde está o maior consumo",
        "Você pode criar cômodos como 'Sala', 'Cozinha', 'Quarto 1'",
        "Aparelhos podem ficar sem cômodo se preferir"
      ]
    },
    {
      id: 3,
      title: "Configurando Tarifas",
      description: "Configure as tarifas de energia para calcular os custos reais. Você pode usar tarifa fixa ou por faixa de consumo.",
      component: <TariffTutorial />,
      tips: [
        "Consulte sua conta de luz para obter os valores corretos",
        "TE = Tarifa de Energia, TUSD = Tarifa de Uso do Sistema",
        "Tarifa fixa é mais simples, por faixa é mais precisa"
      ]
    },
    {
      id: 4,
      title: "Adicionando Aparelhos",
      description: "Cadastre todos os aparelhos elétricos com suas especificações para monitorar o consumo individual.",
      component: <DeviceTutorial />,
      tips: [
        "Consulte a etiqueta do aparelho para ver a potência",
        "Estime quantas horas por dia o aparelho fica ligado",
        "Para aparelhos com voltagem, use os campos V, A e FP"
      ]
    },
    {
      id: 5,
      title: "Estabelecendo Metas",
      description: "Defina objetivos de economia.",
      component: <GoalsTutorial />,
      tips: [
        "Metas ajudam a manter o foco na economia",
        "Metas concluídas contribuem para suas conquistas"
      ]
    },
    {
      id: 6,
      title: "Registrando Contas",
      description: "Registre suas contas de luz mensais para acompanhar a economia real e comparar com as estimativas.",
      component: <BillsTutorial />,
      tips: [
        "Digite o consumo em kWh e o valor total da conta",
        "O sistema calcula automaticamente sua economia",
        "Compare os dados reais com suas estimativas"
      ]
    },
    {
      id: 7,
      title: "Desbloqueando Conquistas",
      description: "Ganhe conquistas conforme usa a plataforma e atinge seus objetivos de economia de energia.",
      component: <AchievementsTutorial />,
      tips: [
        "Conquistas são desbloqueadas automaticamente",
        "Cada tipo de ação tem conquistas específicas",
        "Conquistas motivam o uso contínuo da plataforma"
      ]
    }
  ];

  const nextStep = () => {
    const next = (currentStep + 1) % tutorialSteps.length;
    setCurrentStep(next);
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => (prev - 1 + tutorialSteps.length) % tutorialSteps.length);
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
  };

  return (
    <div className="min-h-screen pt-[80px] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
      <Header nome={user?.displayName || user?.email || "Usuário"} />
      
      <div className="container mx-auto max-w-7xl">
        {/* Header do Tutorial */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Tutorial Interativo
          </h1>
          <p className="text-slate-400 text-lg">Aprenda a usar o EcoQuest passo a passo</p>
        </motion.div>

        {/* Progresso */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Progresso do Tutorial</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-2 rounded-xl transition-all ${
                  isPlaying ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                }`}
              >
                {isPlaying ? <FiPause /> : <FiPlay />}
              </button>
              <span className="text-sm text-slate-400">
                {isPlaying ? 'Auto-reprodução ativada' : 'Clique para auto-reproduzir'}
              </span>
            </div>
          </div>
          
          {/* Barra de Progresso */}
          <div className="w-full bg-white/10 rounded-full h-3 mb-4">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
            />
          </div>
          
          {/* Steps Navigator */}
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {tutorialSteps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => goToStep(index)}
                className={`p-3 rounded-xl text-xs font-medium transition-all ${
                  index === currentStep
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : completedSteps.includes(index)
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-white/10 text-slate-400 hover:bg-white/20'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Área Principal */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl min-h-[600px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                      <FiBookOpen className="text-blue-400 text-2xl" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {tutorialSteps[currentStep].title}
                      </h2>
                      <p className="text-slate-400">
                        Passo {currentStep + 1} de {tutorialSteps.length}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                    {tutorialSteps[currentStep].description}
                  </p>
                  
                  {tutorialSteps[currentStep].component}
                </motion.div>
              </AnimatePresence>
              
              {/* Navegação */}
              <div className="flex justify-between mt-8">
                <button
                  onClick={prevStep}
                  className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                >
                  <FiArrowLeft />
                  Anterior
                </button>
                
                <button
                  onClick={nextStep}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:shadow-blue-500/25 rounded-xl transition-all"
                >
                  Próximo
                  <FiArrowRight />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar com Dicas */}
          <div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-500/20 rounded-xl">
                  <FiCloudLightning className="text-yellow-400" />
                </div>
                <h3 className="text-lg font-semibold">Dicas Úteis</h3>
              </div>
              
              <div className="space-y-3">
                {tutorialSteps[currentStep].tips.map((tip, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-3 bg-white/5 rounded-xl"
                  >
                    <FiInfo className="text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-300">{tip}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Mini Navegação */}
            <div className="mt-6 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl">
              <h3 className="text-lg font-semibold mb-4">Navegação Rápida</h3>
              <div className="space-y-2">
                {tutorialSteps.map((step, index) => (
                  <button
                    key={step.id}
                    onClick={() => goToStep(index)}
                    className={`w-full text-left p-3 rounded-xl transition-all ${
                      index === currentStep
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-white/5 hover:bg-white/10 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {completedSteps.includes(index) && (
                        <FiCheckCircle className="text-green-400 text-sm" />
                      )}
                      <span className="text-sm font-medium">{step.title}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componentes de Tutorial

function WelcomeComponent() {
  return (
    <div className="text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-32 h-32 mx-auto mb-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center"
      >
        <FiZap className="text-white text-4xl" />
      </motion.div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {[
          { icon: <FiHome />, label: "Locais", color: "blue" },
          { icon: <FiZap />, label: "Aparelhos", color: "green" },
          { icon: <FiTarget />, label: "Metas", color: "red" },
          { icon: <FiAward />, label: "Conquistas", color: "yellow" }
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className={`p-4 bg-${item.color}-500/20 rounded-2xl text-center`}
          >
            <div className={`text-2xl text-${item.color}-400 mb-2`}>
              {item.icon}
            </div>
            <p className="text-sm font-medium">{item.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function LocationTutorial() {
  const [locations, setLocations] = useState(['Minha Casa']);
  const [newLocation, setNewLocation] = useState('');

  const addLocation = () => {
    if (newLocation.trim()) {
      setLocations([...locations, newLocation]);
      setNewLocation('');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FiHome className="text-blue-400" />
          Seus Locais
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {locations.map((location, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-white/10 rounded-xl border border-white/20"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <FiHome className="text-blue-400" />
                </div>
                <span className="font-medium">{location}</span>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="flex gap-3">
          <input
            type="text"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            placeholder="Nome do novo local"
            className="flex-1 p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400"
            onKeyPress={(e) => e.key === 'Enter' && addLocation()}
          />
          <button
            onClick={addLocation}
            className="px-4 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl transition-colors"
          >
            <FiPlus />
          </button>
        </div>
      </div>
      
      <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
        <p className="text-green-400 text-sm">
          💡 Tente adicionar "Escritório" ou "Loja" para ver como funciona!
        </p>
      </div>
    </div>
  );
}

function RoomTutorial() {
  const [rooms, setRooms] = useState(['Sala', 'Cozinha', 'Quarto']);

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Organização por Cômodos</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {rooms.map((room, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 bg-purple-500/20 rounded-xl text-center border border-purple-500/30"
            >
              <FiSettings className="text-purple-400 mx-auto mb-2" />
              <p className="text-sm font-medium">{room}</p>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Simulação de aparelhos por cômodo */}
      <div className="space-y-4">
        <div className="p-4 bg-white/5 rounded-xl">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <FiSettings className="text-purple-400" />
            Sala
          </h4>
          <div className="space-y-2">
            {['TV 55"', 'Air Conditioner', 'Sound System'].map((device, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                <FiZap className="text-green-400 text-sm" />
                <span className="text-sm">{device}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TariffTutorial() {
  const [mode, setMode] = useState<'fixed' | 'range'>('fixed');
  const [rates, setRates] = useState({ te: '0.65', tusd: '0.25' });

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Configuração de Tarifas</h3>
        
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setMode('fixed')}
            className={`px-4 py-2 rounded-xl transition-colors ${
              mode === 'fixed' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white/10 text-slate-400'
            }`}
          >
            Tarifa Fixa
          </button>
          <button
            onClick={() => setMode('range')}
            className={`px-4 py-2 rounded-xl transition-colors ${
              mode === 'range' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white/10 text-slate-400'
            }`}
          >
            Por Faixa
          </button>
        </div>
        
        {mode === 'fixed' ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">TE (R$/kWh)</label>
              <input
                type="number"
                value={rates.te}
                onChange={(e) => setRates({...rates, te: e.target.value})}
                className="w-full p-3 rounded-xl bg-white/10 border border-white/20"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">TUSD (R$/kWh)</label>
              <input
                type="number"
                value={rates.tusd}
                onChange={(e) => setRates({...rates, tusd: e.target.value})}
                className="w-full p-3 rounded-xl bg-white/10 border border-white/20"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {['0-30 kWh', '30-100 kWh', '100+ kWh'].map((range, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
                <span className="w-20 text-sm">{range}</span>
                <input
                  placeholder="TE"
                  className="flex-1 p-2 rounded-lg bg-white/10 border border-white/20 text-sm"
                />
                <input
                  placeholder="TUSD"
                  className="flex-1 p-2 rounded-lg bg-white/10 border border-white/20 text-sm"
                />
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
        <FiDollarSign className="text-yellow-400 mb-2" />
        <p className="text-yellow-400 text-sm">
          Custo estimado mensal: R$ {((parseFloat(rates.te) + parseFloat(rates.tusd)) * 150).toFixed(2)}
        </p>
      </div>
    </div>
  );
}

function DeviceTutorial() {
  const [devices, setDevices] = useState([
    { name: 'Geladeira', power: '150W', hours: '24h', cost: 'R$ 32.40' },
    { name: 'TV', power: '100W', hours: '6h', cost: 'R$ 16.20' }
  ]);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Cadastro de Aparelhos</h3>
      
      <div className="space-y-3 mb-6">
        {devices.map((device, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
            className="flex items-center justify-between p-4 bg-white/10 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <FiZap className="text-green-400" />
              </div>
              <div>
                <p className="font-medium">{device.name}</p>
                <p className="text-sm text-slate-400">{device.power} • {device.hours}/dia</p>
              </div>
            </div>
            <p className="text-green-400 font-medium">{device.cost}</p>
          </motion.div>
        ))}
      </div>
      
      {/* Formulário de exemplo */}
      <div className="p-4 border-2 border-dashed border-blue-500/30 rounded-xl">
        <p className="text-blue-400 mb-3 flex items-center gap-2">
          <FiPlus />
          Adicionar Novo Aparelho
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            placeholder="Nome do aparelho"
            className="p-3 rounded-xl bg-white/10 border border-white/20 text-sm"
          />
          <input
            placeholder="Potência (W)"
            type="number"
            className="p-3 rounded-xl bg-white/10 border border-white/20 text-sm"
          />
          <input
            placeholder="Horas/dia"
            type="number"
            className="p-3 rounded-xl bg-white/10 border border-white/20 text-sm"
          />
        </div>
      </div>
    </div>
  );
}

function GoalsTutorial() {

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<number | null>(null);

  const exampleGoals = [
    { 
      id: 1,
      title: 'Economizar R$ 200 este mês', 
      progress: 65, 
      current: 130,
      target: 200,
      unit: 'R$',
      category: 'economia',
      color: '#22c55e',
      icon: 'FiDollarSign',
      daysLeft: 12,
      status: 'ativa'
    },
    { 
      id: 2,
      title: 'Reduzir consumo em 50 kWh', 
      progress: 80, 
      current: 40,
      target: 50,
      unit: 'kWh',
      category: 'energia',
      color: '#3b82f6',
      icon: 'FiZap',
      daysLeft: 25,
      status: 'ativa'
    },
    { 
      id: 3,
      title: 'Trocar 10 lâmpadas por LED', 
      progress: 100, 
      current: 10,
      target: 10,
      unit: 'unidades',
      category: 'sustentabilidade',
      color: '#10b981',
      icon: 'FiLeaf',
      daysLeft: 0,
      status: 'concluida'
    }
  ];

  const tutorialSteps = [
    "Crie suas próprias metas personalizadas",
    "Defina objetivos, prazos e recompensas",
    "Acompanhe o progresso manualmente",
    "Comemore as conquistas!"
  ];

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      FiDollarSign: <FiDollarSign />,
      FiZap: <FiZap />,
      FiLeaf: <BiLeaf />,
      FiTarget: <FiTarget />
    };
    return icons[iconName] || <FiTarget />;
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Sistema de Metas Personalizadas</h3>
      
      {/* Tutorial Steps */}
      <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <FiTarget className="text-purple-400" />
          <span className="text-purple-400 font-medium">Como Funciona:</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tutorialSteps.map((step, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center">
                <span className="text-purple-400 text-xs font-bold">{index + 1}</span>
              </div>
              <span className="text-white">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Botão Criar Meta */}
      <div className="mb-6">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="w-full p-4 border-2 border-dashed border-blue-500/30 rounded-xl hover:border-blue-500/50 transition-colors group"
        >
          <div className="flex flex-col items-center gap-2">
            <FiPlus className="text-blue-400 text-2xl group-hover:scale-110 transition-transform" />
            <span className="text-blue-400 font-medium">Criar Nova Meta</span>
            <span className="text-slate-400 text-sm">Clique para personalizar seus objetivos</span>
          </div>
        </button>
      </div>

      {/* Formulário de Exemplo */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10"
        >
          <h5 className="font-medium mb-3 text-blue-400">Exemplo: Criando uma Meta</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              placeholder="Ex: Economizar R$ 300"
              className="p-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm"
              readOnly
            />
            <select className="p-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm">
              <option>Economia de Dinheiro</option>
            </select>
            <input
              placeholder="300"
              className="p-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm"
              readOnly
            />
            <input
              type="date"
              className="p-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm"
              readOnly
            />
          </div>
          <div className="mt-3 flex gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg"></div>
            <div className="w-8 h-8 bg-blue-500 rounded-lg opacity-50"></div>
            <div className="w-8 h-8 bg-purple-500 rounded-lg opacity-50"></div>
          </div>
        </motion.div>
      )}

      {/* Metas de Exemplo */}
      <div className="space-y-4 mb-6">
        <h4 className="font-medium text-white flex items-center gap-2">
          <FiStar className="text-yellow-400" />
          Suas Metas Ativas
        </h4>
        
        {exampleGoals.map((goal, index) => (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
            className="p-4 rounded-2xl border border-white/10 hover:border-white/20 transition-all cursor-pointer"
            style={{ backgroundColor: `${goal.color}10` }}
            onClick={() => setSelectedGoal(selectedGoal === goal.id ? null : goal.id)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div 
                  className="p-2 rounded-xl"
                  style={{ backgroundColor: `${goal.color}20` }}
                >
                  <span style={{ color: goal.color }}>
                    {getIconComponent(goal.icon)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-white">{goal.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span 
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        goal.status === 'concluida' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-blue-500/20 text-blue-400'
                      }`}
                    >
                      {goal.status === 'concluida' ? 'Concluída' : 'Ativa'}
                    </span>
                    {goal.status === 'ativa' && (
                      <span className="text-xs text-slate-400">
                        {goal.daysLeft} dias restantes
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {goal.status === 'ativa' && (
                <button
                  className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs hover:bg-blue-500/30 transition-colors"
                >
                  + Progresso
                </button>
              )}
            </div>

            <div className="mb-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-400">Progresso</span>
                <span className="text-sm text-white">
                  {goal.current} / {goal.target} {goal.unit}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${goal.progress}%` }}
                  transition={{ duration: 1, delay: index * 0.3 }}
                  className="h-3 rounded-full"
                  style={{ backgroundColor: goal.color }}
                />
              </div>
              <p className="text-xs mt-1" style={{ color: goal.color }}>
                {goal.progress}% concluído
              </p>
            </div>

            {/* Detalhes Expandidos */}
            {selectedGoal === goal.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="pt-3 border-t border-white/10"
              >
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold" style={{ color: goal.color }}>
                      {goal.current}
                    </p>
                    <p className="text-xs text-slate-400">Atual</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{goal.target}</p>
                    <p className="text-xs text-slate-400">Meta</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{goal.target - goal.current}</p>
                    <p className="text-xs text-slate-400">Restante</p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Recursos do Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
          <FiCheckCircle className="text-green-400 mb-2" />
          <p className="text-green-400 text-sm font-medium mb-1">Controle Total</p>
          <p className="text-green-300 text-xs">
            Você define objetivos, prazos, categorias e acompanha seu próprio progresso
          </p>
        </div>
        
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <FiAward className="text-blue-400 mb-2" />
          <p className="text-blue-400 text-sm font-medium mb-1">Gamificação</p>
          <p className="text-blue-300 text-xs">
            Marcos, recompensas e visual personalizado para manter você motivado
          </p>
        </div>
      </div>

      {/* Dica Final */}
      <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
        <div className="flex items-start gap-3">
          <FiTarget className="text-purple-400 mt-1" />
          <div>
            <p className="text-purple-400 text-sm font-medium mb-1">💡 Dica Pro:</p>
            <p className="text-purple-300 text-xs leading-relaxed">
              Comece com metas pequenas e alcançáveis. Defina marcos intermediários 
              e celebre cada conquista para manter a motivação alta!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BillsTutorial() {
  const [bills, setBills] = useState([
    { month: '2025-01', consumption: 180, value: 145.50 },
    { month: '2025-02', consumption: 165, value: 132.80 },
    { month: '2025-03', consumption: 150, value: 120.00 }
  ]);

  const calculateSavings = () => {
    if (bills.length < 2) return { money: 0, energy: 0 };
    const first = bills[0];
    const last = bills[bills.length - 1];
    return {
      money: first.value - last.value,
      energy: first.consumption - last.consumption
    };
  };

  const savings = calculateSavings();

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Registro de Contas de Luz</h3>
      
      {/* Economia visualizada */}
      {savings.money > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-green-500/20 border border-green-500/30 rounded-xl mb-6"
        >
          <div className="text-center">
            <FiTrendingUp className="text-green-400 text-2xl mx-auto mb-2" />
            <p className="text-green-400 font-semibold">
              Economia Total: R$ {savings.money.toFixed(2)} • {savings.energy} kWh
            </p>
          </div>
        </motion.div>
      )}
      
      {/* Lista de contas */}
      <div className="space-y-3 mb-6">
        {bills.map((bill, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-4 bg-white/10 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <FiCalendar className="text-blue-400" />
              </div>
              <div>
                <p className="font-medium">
                  {new Date(bill.month + '-01').toLocaleDateString('pt-BR', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
                <p className="text-sm text-slate-400">{bill.consumption} kWh</p>
              </div>
            </div>
            <p className="text-green-400 font-medium">R$ {bill.value.toFixed(2)}</p>
          </motion.div>
        ))}
      </div>
      
      {/* Formulário de exemplo */}
      <div className="p-4 border-2 border-dashed border-green-500/30 rounded-xl">
        <p className="text-green-400 mb-3 flex items-center gap-2">
          <FiPlus />
          Adicionar Nova Conta
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="month"
            className="p-3 rounded-xl bg-white/10 border border-white/20 text-sm"
          />
          <input
            placeholder="Consumo (kWh)"
            type="number"
            className="p-3 rounded-xl bg-white/10 border border-white/20 text-sm"
          />
          <input
            placeholder="Valor total (R$)"
            type="number"
            className="p-3 rounded-xl bg-white/10 border border-white/20 text-sm"
          />
        </div>
      </div>
    </div>
  );
}

function AchievementsTutorial() {
  const [achievements, setAchievements] = useState([
    { 
      title: 'Primeiro Passo', 
      description: 'Cadastre seu primeiro aparelho', 
      unlocked: true,
      difficulty: 'fácil'
    },
    { 
      title: 'Organizador', 
      description: 'Crie 3 cômodos diferentes', 
      unlocked: true,
      difficulty: 'fácil'
    },
    { 
      title: 'Economista', 
      description: 'Economize R$ 50 em um mês', 
      unlocked: false,
      difficulty: 'médio'
    },
    { 
      title: 'Especialista', 
      description: 'Configure 10 aparelhos', 
      unlocked: false,
      difficulty: 'difícil'
    }
  ]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'fácil': return 'green';
      case 'médio': return 'yellow';
      case 'difícil': return 'red';
      default: return 'gray';
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Sistema de Conquistas</h3>
      
      {/* Estatísticas */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-green-500/20 rounded-xl">
          <p className="text-2xl font-bold text-green-400">
            {achievements.filter(a => a.unlocked).length}
          </p>
          <p className="text-sm text-green-400">Desbloqueadas</p>
        </div>
        <div className="text-center p-3 bg-blue-500/20 rounded-xl">
          <p className="text-2xl font-bold text-blue-400">
            {achievements.filter(a => !a.unlocked).length}
          </p>
          <p className="text-sm text-blue-400">Pendentes</p>
        </div>
        <div className="text-center p-3 bg-purple-500/20 rounded-xl">
          <p className="text-2xl font-bold text-purple-400">
            {Math.round((achievements.filter(a => a.unlocked).length / achievements.length) * 100)}%
          </p>
          <p className="text-sm text-purple-400">Progresso</p>
        </div>
      </div>
      
      {/* Lista de conquistas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((achievement, index) => {
          const color = getDifficultyColor(achievement.difficulty);
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-4 rounded-xl border transition-all ${
                achievement.unlocked
                  ? `bg-${color}-500/20 border-${color}-500/30`
                  : 'bg-white/5 border-white/10 opacity-60 grayscale'
              }`}
            >
              {/* Ícone de status */}
              <div className={`absolute top-3 right-3 p-1 rounded-full ${
                achievement.unlocked ? 'bg-green-500/20' : 'bg-gray-500/20'
              }`}>
                {achievement.unlocked ? (
                  <FiCheckCircle className="text-green-400 text-sm" />
                ) : (
                  <FiStar className="text-gray-400 text-sm" />
                )}
              </div>
              
              <div className="pr-8">
                <div className="flex items-center gap-2 mb-2">
                  <FiAward className={achievement.unlocked ? `text-${color}-400` : 'text-gray-400'} />
                  <h4 className="font-semibold text-sm">{achievement.title}</h4>
                </div>
                <p className="text-xs text-slate-400 mb-2">{achievement.description}</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium bg-${color}-500/20 text-${color}-400`}>
                  {achievement.difficulty}
                </span>
              </div>
              
              {/* Efeito de brilho para conquistas desbloqueadas */}
              {achievement.unlocked && (
                <motion.div
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12"
                />
              )}
            </motion.div>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
        <FiStar className="text-purple-400 mb-2" />
        <p className="text-purple-400 text-sm">
          Conquistas são desbloqueadas automaticamente conforme você usa a plataforma!
        </p>
      </div>
    </div>
  );
}