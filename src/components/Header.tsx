'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import Image from 'next/image';

interface HeaderProps {
  nome: string;
  exibirBoasVindas?: boolean;
  children?: React.ReactNode;
}

export default function Header({ nome, exibirBoasVindas = true, children }: HeaderProps) {
  const [menuAberto, setMenuAberto] = useState(false);
  const router = useRouter();

  const sair = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#0D1117]/80 backdrop-blur-md border-b border-white/10">
      <div className="flex items-center justify-between px-6 sm:px-10 py-4">
        {exibirBoasVindas && (
          <h1 className="text-xl sm:text-2xl font-bold text-[#00BFFF] drop-shadow-[0_0_12px_#00BFFF]">
            Olá, {nome}
          </h1>
        )}
        <div className="relative flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setMenuAberto(!menuAberto)}
              className="w-10 h-10 flex items-center justify-center bg-[#00BFFF] rounded-full shadow hover:scale-105 transition overflow-hidden"
            >
              <Image src="/favicon.ico" alt="menu" width={32} height={32} className="rounded-full" />
            </button>
            {menuAberto && (
             <div className="absolute right-0 mt-2 bg-[#161B22] border border-white/10 shadow-xl rounded-xl p-3 w-56 space-y-2 z-50">

                <button onClick={() => { router.push("/dashboard"); setMenuAberto(false); }} className="w-full text-left px-4 py-2 rounded hover:bg-[#1E90FF]/20">Dashboard</button>
                <button onClick={() => { router.push("/dashboard/metas"); setMenuAberto(false); }} className="w-full text-left px-4 py-2 rounded hover:bg-[#1E90FF]/20">Metas</button>
                <button onClick={() => { router.push("/dashboard/perfil"); setMenuAberto(false); }} className="w-full text-left px-4 py-2 rounded hover:bg-[#1E90FF]/20">Conquistas</button>
                <button onClick={() => { router.push("/dashboard/tutorial"); setMenuAberto(false); }} className="w-full text-left px-4 py-2 rounded hover:bg-[#1E90FF]/20">Tutorial</button>
                <button onClick={() => { router.push("/dashboard/contas"); setMenuAberto(false); }} className="w-full text-left px-4 py-2 rounded hover:bg-[#1E90FF]/20">Contas</button>
                <button onClick={() => { sair(); setMenuAberto(false); }} className="w-full text-left px-4 py-2 text-red-500 rounded hover:bg-red-900/20">Sair</button>
              </div>
            )}
          </div>
          {children}
        </div>
      </div>
    </header>
  );
}
