'use client'
import Link from "next/link";
import { motion } from "framer-motion";
import AnimatedBackground from '../components/AnimatedBackground';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';

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
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-background text-white">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start text-center sm:text-left max-w-2xl">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl sm:text-5xl font-bold text-[#00BFFF] drop-shadow-[0_0_12px_#00BFFF]"
        >
          Diminui AI ⚡
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg sm:text-xl text-gray-300"
        >
          Descubra o quanto você gasta com energia elétrica. Cadastre seus aparelhos e veja dicas para economizar.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link
            href="/login"
            className="px-6 py-3 text-black bg-[#00BFFF] rounded-2xl font-semibold shadow-xl hover:scale-105 transition drop-shadow-[0_0_8px_#00BFFF]"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 border border-[#00BFFF] text-[#00BFFF] rounded-2xl font-semibold hover:bg-[#00BFFF] hover:text-black transition"
          >
            Registar-se
          </Link>
        </motion.div>
      </main>
    </div>
    </>
  );
}
