'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createUserWithEmailAndPassword, updateProfile, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../firebase';
import AnimatedBackground from '../../components/AnimatedBackground';


export default function Register() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) router.push('/dashboard');
    });
    return () => unsubscribe();
  }, [router]);

  const handleRegister = async () => {
    if (senha !== confirmar) {
      setErro('As senhas não coincidem');
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, senha);
      if (auth.currentUser && nome) {
        await updateProfile(auth.currentUser, { displayName: nome });
      }
      router.push('/dashboard');
    } catch (error: any) {
      setErro('Erro ao registrar: ' + error.message);
    }
  };

  return (
    <>
      <AnimatedBackground />


      <div className="relative z-10 grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 sm:p-20 bg-black/70 text-white font-sans">
        <main className="row-start-2 flex w-full max-w-xl flex-col items-center gap-6 rounded-2xl border border-white/30 bg-black/30 p-8 text-center shadow-[0_0_24px_#00BFFF50] backdrop-blur-lg sm:items-start sm:text-left">
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold text-[#00BFFF] drop-shadow-[0_0_12px_#00BFFF]"
          >
            Registre-se
          </motion.h1>

          <input
            type="text"
            placeholder="Nome completo"
            className="w-full rounded-xl border border-white/20 bg-white/10 p-3 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00BFFF]/50"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            autoComplete="name"
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-xl border border-white/20 bg-white/10 p-3 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00BFFF]/50"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />

          <div className="relative w-full">
            <input
              type={mostrarSenha ? 'text' : 'password'}
              placeholder="Senha"
              className="w-full rounded-xl border border-white/20 bg-white/10 p-3 pr-12 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00BFFF]/50"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <input
            type="password"
            placeholder="Confirmar senha"
            className="w-full rounded-xl border border-white/20 bg-white/10 p-3 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00BFFF]/50"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            autoComplete="new-password"
          />

          <button
            onClick={handleRegister}
            className="w-full rounded-2xl bg-[#00BFFF] px-6 py-3 font-semibold text-black shadow-xl transition hover:scale-105 drop-shadow-[0_0_8px_#00BFFF]"
          >
            Registrar
          </button>

          {erro && (
            <p className="w-full text-center text-sm text-red-500 sm:text-left">
              {erro}
            </p>
          )}
        </main>
      </div>
    </>
  );
}
