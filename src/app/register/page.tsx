'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createUserWithEmailAndPassword, updateProfile, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../firebase';
import Link from 'next/link';
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiZap,
  FiShield,
  FiTrendingUp,
  FiStar,
  FiCheck,
  FiX
} from 'react-icons/fi';

// Componente de fundo animado
function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Gradiente base */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
      
      {/* Partículas flutuantes */}
      {Array.from({ length: 25 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-40"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
          }}
          animate={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
          }}
          transition={{
            duration: Math.random() * 15 + 15,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      ))}
      
      {/* Formas geométricas animadas */}
      <motion.div
        className="absolute top-1/3 left-1/5 w-72 h-72 bg-green-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
        }}
      />
      
      <motion.div
        className="absolute bottom-1/3 right-1/5 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1.3, 1, 1.3],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
        }}
      />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />
    </div>
  );
}

// Validador de senha
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'Pelo menos 6 caracteres', valid: password.length >= 6 },
    { label: 'Contém número', valid: /\d/.test(password) },
    { label: 'Contém letra maiúscula', valid: /[A-Z]/.test(password) },
    { label: 'Contém caractere especial', valid: /[!@#$%^&*(),.?":{}|<>]/.test(password) }
  ];

  if (!password) return null;

  return (
    <div className="mt-3 space-y-2">
      {checks.map((check, index) => (
        <div key={index} className="flex items-center gap-2 text-xs">
          {check.valid ? (
            <FiCheck className="text-green-400" />
          ) : (
            <FiX className="text-red-400" />
          )}
          <span className={check.valid ? 'text-green-400' : 'text-red-400'}>
            {check.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Register() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) router.push('/dashboard');
    });
    return () => unsubscribe();
  }, [router]);

  const validateForm = () => {
    if (!nome.trim()) {
      setErro('Por favor, digite seu nome completo.');
      return false;
    }
    if (!email.trim()) {
      setErro('Por favor, digite seu email.');
      return false;
    }
    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return false;
    }
    if (senha !== confirmar) {
      setErro('As senhas não coincidem.');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErro('');

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, senha);
      if (auth.currentUser && nome) {
        await updateProfile(auth.currentUser, { displayName: nome });
      }
      router.push('/dashboard');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setErro('Este email já está sendo usado por outra conta.');
      } else if (error.code === 'auth/invalid-email') {
        setErro('Email inválido.');
      } else if (error.code === 'auth/weak-password') {
        setErro('Senha muito fraca. Use pelo menos 6 caracteres.');
      } else {
        setErro('Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRegister();
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Seção de Branding */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left order-2 lg:order-1"
          >
            <div className="flex items-center justify-center lg:justify-start gap-4 mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg"
              >
                <FiZap className="text-white text-2xl" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                  EcoQuest
                </h1>
                <p className="text-slate-400">Gestão Inteligente de Energia</p>
              </div>
            </div>
            
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Comece sua jornada sustentável!
            </h2>
            
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Junte-se a milhares de usuários que já economizam energia e dinheiro 
              com nossa plataforma inteligente de gestão energética.
            </p>
            
            {/* Benefits */}
            <div className="grid grid-cols-1 gap-4 mb-8">
              {[
                { 
                  icon: <FiTrendingUp />, 
                  title: 'Economize até 30%', 
                  desc: 'Reduza sua conta de energia significativamente' 
                },
                { 
                  icon: <FiStar />, 
                  title: 'Sistema de Metas', 
                  desc: 'Gamificação para manter você motivado' 
                },
                { 
                  icon: <FiShield />, 
                  title: 'Dados Seguros', 
                  desc: 'Sua privacidade é nossa prioridade' 
                },
                { 
                  icon: <FiZap />, 
                  title: 'Fácil de Usar', 
                  desc: 'Interface intuitiva e tutorial completo' 
                }
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 * index }}
                  className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
                >
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <span className="text-green-400 text-xl">{benefit.icon}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">{benefit.title}</p>
                    <p className="text-sm text-slate-400">{benefit.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Formulário de Registro */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-md mx-auto lg:mx-0 order-1 lg:order-2"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center mb-8"
              >
                <h3 className="text-2xl font-bold text-white mb-2">
                  Criar Conta
                </h3>
                <p className="text-slate-400">
                  Preencha os dados para começar
                </p>
              </motion.div>

              <div className="space-y-5">
                {/* Campo Nome */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      placeholder="seu@email.com"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur-sm text-white border border-white/20 placeholder-slate-400 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 outline-none transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={handleKeyPress}
                      autoComplete="email"
                    />
                  </div>
                </motion.div>

                {/* Campo Senha */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type={mostrarSenha ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white/10 backdrop-blur-sm text-white border border-white/20 placeholder-slate-400 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 outline-none transition-all"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      onKeyPress={handleKeyPress}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenha(!mostrarSenha)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {mostrarSenha ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  <PasswordStrength password={senha} />
                </motion.div>

                {/* Campo Confirmar Senha */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Confirmar Senha
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type={mostrarConfirmar ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`w-full pl-12 pr-12 py-4 rounded-2xl bg-white/10 backdrop-blur-sm text-white border placeholder-slate-400 outline-none transition-all ${
                        confirmar && senha !== confirmar
                          ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/20'
                          : confirmar && senha === confirmar
                          ? 'border-green-400 focus:border-green-400 focus:ring-2 focus:ring-green-400/20'
                          : 'border-white/20 focus:border-green-400 focus:ring-2 focus:ring-green-400/20'
                      }`}
                      value={confirmar}
                      onChange={(e) => setConfirmar(e.target.value)}
                      onKeyPress={handleKeyPress}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {mostrarConfirmar ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {confirmar && (
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      {senha === confirmar ? (
                        <>
                          <FiCheck className="text-green-400" />
                          <span className="text-green-400">As senhas coincidem</span>
                        </>
                      ) : (
                        <>
                          <FiX className="text-red-400" />
                          <span className="text-red-400">As senhas não coincidem</span>
                        </>
                      )}
                    </div>
                  )}
                </motion.div>

                {/* Botão de Registro */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  onClick={handleRegister}
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-green-500/25 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <>
                      Criar Conta
                      <FiArrowRight />
                    </>
                  )}
                </motion.button>

                {/* Mensagem de Erro */}
                {erro && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
                  >
                    <p className="text-red-400 text-sm text-center">{erro}</p>
                  </motion.div>
                )}

                {/* Link para Login */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="text-center"
                >
                  <p className="text-slate-400">
                    Já tem uma conta?{' '}
                    <Link 
                      href="/auth/login" 
                      className="text-green-400 hover:text-green-300 font-medium transition-colors"
                    >
                      Faça login aqui
                    </Link>
                  </p>
                </motion.div>

                {/* Termos de Uso */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-center"
                >
                  <p className="text-xs text-slate-500">
                    Ao criar uma conta, você aceita nossos{' '}
                    <span className="text-green-400 hover:text-green-300 cursor-pointer">
                      Termos de Uso
                    </span>{' '}
                    e{' '}
                    <span className="text-green-400 hover:text-green-300 cursor-pointer">
                      Política de Privacidade
                    </span>
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}