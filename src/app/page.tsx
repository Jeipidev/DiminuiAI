'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';
import {
  FiZap,
  FiTrendingDown,
  FiTarget,
  FiAward,
  FiShield,
  FiBarChart,
  FiStar,
  FiCheckCircle,
  FiArrowRight,
  FiPlay,
  FiUsers,
  FiDollarSign,
  FiCpu,
  FiHome,
  FiSmartphone,
  FiUser
} from 'react-icons/fi';

// Componente de fundo animado sem elementos que causam hidratação
function EnhancedAnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Gradiente base */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
      
      {/* Ondas de energia com posições fixas */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
        }}
      />
      
      <motion.div
        className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-green-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1.5, 1, 1.5],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
        }}
      />
      
      <motion.div
        className="absolute top-1/2 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.6, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
        }}
      />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
      
      {/* Elementos decorativos fixos */}
      <motion.div
        className="absolute top-20 left-20 text-6xl text-blue-400/20"
        animate={{
          rotate: [0, 360],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
        }}
      >
        ⚡
      </motion.div>
      
      <motion.div
        className="absolute bottom-32 right-32 text-4xl text-green-400/20"
        animate={{
          rotate: [360, 0],
          scale: [1.2, 1, 1.2],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
        }}
      >
        🌱
      </motion.div>
    </div>
  );
}

// Estatísticas animadas
function AnimatedStats() {
  const stats = [
    { icon: <FiUsers />, value: '10k+', label: 'Usuários Ativos', color: 'blue' },
    { icon: <FiDollarSign />, value: '30%', label: 'Economia Média', color: 'green' },
    { icon: <FiZap />, value: '50k+', label: 'Aparelhos Cadastrados', color: 'yellow' },
    { icon: <FiAward />, value: '1M+', label: 'Metas Atingidas', color: 'purple' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
        >
          <div className={`inline-flex p-3 rounded-xl bg-${stat.color}-500/20 mb-3`}>
            <span className={`text-${stat.color}-400 text-2xl`}>{stat.icon}</span>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
            className="text-2xl font-bold text-white mb-1"
          >
            {stat.value}
          </motion.div>
          <p className="text-slate-400 text-sm">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}

// Seção de Features
function FeaturesSection() {
  const features = [
    {
      icon: <FiBarChart />,
      title: 'Análise Inteligente',
      description: 'Monitore seu consumo em tempo real com gráficos detalhados e insights personalizados.',
      color: 'blue'
    },
    {
      icon: <FiTarget />,
      title: 'Metas Gamificadas',
      description: 'Estabeleça objetivos de economia e acompanhe seu progresso com nosso sistema de recompensas.',
      color: 'red'
    },
    {
      icon: <FiTrendingDown />,
      title: 'Economia Garantida',
      description: 'Reduza sua conta de energia em até 30% com nossas dicas personalizadas de otimização.',
      color: 'green'
    },
    {
      icon: <FiShield />,
      title: 'Dados Seguros',
      description: 'Sua privacidade é nossa prioridade. Dados criptografados e armazenamento seguro.',
      color: 'purple'
    },
    {
      icon: <FiCpu />,
      title: 'IA Avançada',
      description: 'Algoritmos inteligentes que aprendem seus hábitos e sugerem melhorias automáticas.',
    },
    {
      icon: <FiSmartphone />,
      title: 'Multiplataforma',
      description: 'Acesse de qualquer dispositivo - desktop, tablet ou smartphone, sempre sincronizado.',
      color: 'pink'
    }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Funcionalidades Poderosas
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Descubra como o EcoQuest pode revolucionar sua relação com a energia elétrica
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ delay: index * 0.1 }}
              className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:border-white/20 transition-all duration-300 group"
            >
              <div className={`inline-flex p-4 rounded-2xl bg-${feature.color}-500/20 mb-6 group-hover:bg-${feature.color}-500/30 transition-colors`}>
                <span className={`text-${feature.color}-400 text-3xl`}>{feature.icon}</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
              <p className="text-slate-300 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Seção de CTA
function CTASection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl border border-white/20 rounded-3xl p-12 text-center"
        >
          <h2 className="text-4xl font-bold text-white mb-6">
            Pronto para Economizar?
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de usuários que já reduziram suas contas de energia. 
            Comece gratuitamente hoje mesmo!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-blue-500/25 transition-all duration-300 flex items-center gap-2"
              >
                Começar Gratuitamente
                <FiArrowRight />
              </motion.button>
            </Link>
            
            <Link href="/demo">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border border-white/20 text-white rounded-2xl font-semibold hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
              >
                <FiPlay />
                Ver Demo
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) router.push('/dashboard');
    });
    return () => unsubscribe();
  }, [router, mounted]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <EnhancedAnimatedBackground />
      
      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-6 text-center">
          
          {/* Logo e Branding */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center justify-center gap-4 mb-8"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center shadow-2xl"
            >
              <FiZap className="text-white text-3xl" />
            </motion.div>
            <div className="text-left">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                EcoQuest
              </h1>
              <p className="text-slate-400 text-lg">Gestão Inteligente de Energia</p>
            </div>
          </motion.div>

          {/* Título Principal */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Transforme sua{' '}
            <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              energia
            </span>
            <br />
            em{' '}
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              economia
            </span>
          </motion.h2>

          {/* Subtítulo */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-xl md:text-2xl text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed"
          >
            Descubra o poder da gestão inteligente de energia. Monitore, otimize e economize 
            com nossa plataforma gamificada que torna a sustentabilidade divertida e lucrativa.
          </motion.p>

          {/* Botões de Ação */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
          >
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-semibold rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 flex items-center gap-3"
              >
                <FiZap />
                Começar Gratuitamente
                <FiArrowRight />
              </motion.button>
            </Link>
            
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-5 border-2 border-white/20 text-white text-lg font-semibold rounded-2xl hover:bg-white/10 hover:border-white/40 transition-all duration-300 flex items-center gap-3"
              >
                <FiUser />
                Já tenho conta
              </motion.button>
            </Link>
          </motion.div>

          {/* Benefícios Rápidos */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="flex flex-wrap justify-center gap-8 text-sm text-slate-400"
          >
            {[
              { icon: <FiCheckCircle />, text: 'Gratuito para sempre' },
              { icon: <FiShield />, text: 'Dados 100% seguros' },
              { icon: <FiStar />, text: 'Interface intuitiva' },
              { icon: <FiTarget />, text: 'Impacto ambiental positivo' }
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-green-400">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Elementos Decorativos Fixos */}
        <div className="absolute top-1/4 left-1/4 text-8xl text-blue-400/10 pointer-events-none">
          ⚡
        </div>
        <div className="absolute bottom-1/4 right-1/4 text-6xl text-green-400/10 pointer-events-none">
          🌱
        </div>
      </section>

      {/* Estatísticas */}
      <section className="relative z-10 py-20 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Resultados que Impressionam
            </h2>
            <p className="text-slate-300 text-lg">
              Números reais de uma comunidade engajada
            </p>
          </motion.div>
          <AnimatedStats />
        </div>
      </section>

      {/* Features */}
      <div className="relative z-10">
        <FeaturesSection />
      </div>

      {/* CTA Final */}
      <div className="relative z-10">
        <CTASection />
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-white/10">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <FiZap className="text-white" />
            </div>
            <span className="text-xl font-bold text-white">EcoQuest</span>
          </div>
          <p className="text-slate-400">
            © 2025 EcoQuest. Transformando energia em economia desde 2025.
          </p>
        </div>
      </footer>
    </div>
  );
}
