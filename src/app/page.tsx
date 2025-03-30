'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';
import AnimatedBackground from '../components/AnimatedBackground';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) router.push('/dashboard');
    });
    return () => unsubscribe();
  }, [router]);

  return (
    <>
      <AnimatedBackground />
      <div className="relative z-10 grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 sm:p-20 bg-black/70 text-white font-sans">

        <main className="row-start-2 flex max-w-2xl flex-col items-center gap-8 text-center sm:items-start sm:text-left">
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold text-[#00BFFF] drop-shadow-[0_0_12px_#00BFFF] sm:text-5xl"
          >
            Diminui AI ⚡
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-gray-300 sm:text-xl"
          >
            Descubra o quanto você gasta com energia elétrica. Cadastre seus
            aparelhos e veja dicas para economizar.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col gap-4 sm:flex-row"
          >
            <Link
              href="/login"
              className="rounded-2xl bg-[#00BFFF] px-6 py-3 font-semibold text-black shadow-xl transition hover:scale-105 drop-shadow-[0_0_8px_#00BFFF]"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="rounded-2xl border border-[#00BFFF] px-6 py-3 font-semibold text-[#00BFFF] transition hover:bg-[#00BFFF] hover:text-black"
            >
              Registrar-se
            </Link>
          </motion.div>
        </main>
      </div>
    </>
  );
}
