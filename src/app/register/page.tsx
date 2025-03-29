'use client'
import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../../firebase';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import AnimatedBackground from '../../components/AnimatedBackground';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';


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
      setErro(error.message);
    }
  };

  return (
    <>
      <AnimatedBackground />
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 bg-background text-white">
        <main className="flex flex-col gap-6 row-start-2 items-center sm:items-start text-center sm:text-left w-full max-w-xl border border-white/30 rounded-2xl p-8 shadow-[0_0_24px_#00BFFF50]">
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold text-primary drop-shadow-[0_0_12px_#00BFFF]"
          >
            Registre-se
          </motion.h1>

          <input
            type="text"
            placeholder="Nome completo"
            className="w-full p-3 rounded-xl border border-white/20 bg-card text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded-xl border border-white/20 bg-card text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="relative w-full">
            <input
              type={mostrarSenha ? 'text' : 'password'}
              placeholder="Senha"
              className="w-full p-3 pr-12 rounded-xl border border-white/20 bg-card text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setMostrarSenha(!mostrarSenha)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-primary hover:underline"
            >
              {mostrarSenha ? 'Ocultar' : 'Ver'}
            </button>
          </div>
          <input
            type="password"
            placeholder="Confirmar senha"
            className="w-full p-3 rounded-xl border border-white/20 bg-card text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
          />
          <button
            onClick={handleRegister}
            className=" w-full px-6 py-3 text-black bg-[#00BFFF] rounded-2xl font-semibold shadow-xl hover:scale-105 transition drop-shadow-[0_0_8px_#00BFFF]"
          >
            Registrar
          </button>
          {erro && <p className="text-red-500">{erro}</p>}
        </main>
      </div>
    </>
  );
}
