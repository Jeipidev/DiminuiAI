"use client";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../../firebase';
import AnimatedBackground from '../../../components/AnimatedBackground';
import { motion } from 'framer-motion';

export default function Tutorial() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) router.push('/login');
    });
    return () => unsubscribe();
  }, [router]);

  return (
    <>
      <AnimatedBackground />
      <div className="relative z-10 min-h-screen pt-[80px] p-6 sm:p-10 bg-[#0D1117] text-white font-sans space-y-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-3xl sm:text-4xl font-bold text-[#00BFFF] drop-shadow-[0_0_12px_#00BFFF]"
        >
          Como usar o Dashboard ⚡
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-6 text-lg leading-relaxed text-gray-300"
        >
          <p>
            O dashboard é onde você vai monitorar todo o seu consumo elétrico. Veja abaixo o que cada seção faz:
          </p>

          <ul className="list-disc pl-6 space-y-4">
            <li>
              <span className="text-white font-semibold">Cabeçalho:</span> Fixo no topo com seu nome/email, botão de sair e acesso ao tutorial.
            </li>
            <li>
              <span className="text-white font-semibold">Tarifas de luz:</span> Informe suas tarifas (R$/kWh). Se tiver variação mensal ou de região, adicione várias. Use "Salvar tarifas" para persistir os dados.
            </li>
            <li>
              <span className="text-white font-semibold">Adicionar eletrônico:</span> Cadastre seus aparelhos com:
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>Nome</strong>: ex. Geladeira</li>
                <li><strong>Valor</strong>: Consumo (em W, kW, VA, etc)</li>
                <li><strong>Unidade</strong>: selecione a unidade correta</li>
                <li><strong>Horas/dia</strong>: média de uso por dia</li>
              </ul>
              Clique em "Adicionar" para salvar.
            </li>
            <li>
              <span className="text-white font-semibold">Seus eletrônicos:</span> Lista de todos cadastrados. Você pode:
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Editar horas/dia diretamente</li>
                <li>Remover um item clicando em "Remover"</li>
              </ul>
            </li>
            <li>
              <span className="text-white font-semibold">Resumo:</span> Exibe o <strong>consumo total</strong> estimado (em kWh/mês) e o <strong>custo mensal</strong> com base na média das tarifas.
            </li>
            <li>
              <span className="text-white font-semibold">Gráficos:</span> Visualização clara e intuitiva:
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>Consumo por aparelho:</strong> total mensal de cada item</li>
                <li><strong>Tempo de uso:</strong> comparação de horas/dia entre os aparelhos</li>
              </ul>
            </li>
          </ul>

          <p>
            Todas as ações salvam os dados na nuvem (Firebase), e podem ser acessadas em qualquer dispositivo.
            O sistema é responsivo e otimizado para celular e desktop.
          </p>
        </motion.div>

        <div className="pt-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-[#00BFFF] text-black font-semibold rounded-xl shadow-xl hover:scale-105 transition drop-shadow-[0_0_8px_#00BFFF]"
          >
            Voltar para o Dashboard
          </button>
        </div>
      </div>
    </>
  );
}
