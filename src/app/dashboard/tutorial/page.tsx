"use client";
import React from "react";
import Header from "@/components/Header";
import AnimatedBackground from "@/components/AnimatedBackground";
import { motion } from "framer-motion";
import Link from "next/link";

export default function TutorialPage() {
  return (
    <>
      <AnimatedBackground />
      <div className="relative z-10 grid min-h-screen gap-16 p-8 pb-20 sm:p-20 bg-black/70 text-white font-sans">
        <Header nome="Tutorial" />
        <div className="container mx-auto p-6">
          <motion.h1
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-4xl font-bold text-center mb-10"
          >
            Tutorial: Como Usar o Site
          </motion.h1>

          {/* Introdução */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="mb-10"
          >
            <h2 className="text-2xl font-semibold mb-4">Introdução</h2>
            <p className="text-lg mb-4">
              Bem-vindo ao nosso site! Aqui você pode gerenciar seus aparelhos, controlar o consumo de energia, visualizar conquistas, gerenciar locais e cômodos, e muito mais.
            </p>
            <p className="text-lg mb-4">
              Este tutorial o guiará por cada funcionalidade do sistema.
            </p>
          </motion.section>

          {/* Dashboard e Gerenciamento */}
          <motion.section
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="mb-10"
          >
            <h2 className="text-2xl font-semibold mb-4">Dashboard e Gerenciamento</h2>
            <p className="text-lg mb-4">
              Após o login, você será direcionado para a Dashboard. Nela, você pode:
            </p>
            <ul className="list-disc ml-6 text-lg mb-4">
              <li>Visualizar seu consumo de energia e custos</li>
              <li>Adicionar e gerenciar seus aparelhos</li>
              <li>Organizar seus locais e cômodos</li>
              <li>Acessar conquistas, metas e outras funcionalidades</li>
            </ul>
            <p className="text-lg mb-4">
              Utilize os botões de navegação para explorar cada seção. Eles foram cuidadosamente animados para proporcionar uma experiência agradável.
            </p>
          </motion.section>

          {/* Locais, Cômodos e Tarifas */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 1 }}
            className="mb-10"
          >
            <h2 className="text-2xl font-semibold mb-4">Locais, Cômodos e Tarifas</h2>
            <p className="text-lg mb-4">
              Organize seus dados criando <strong>locais</strong> (por exemplo, sua casa, escritório, etc.) e, dentro de cada local, <strong>cômodos</strong> para separar seus aparelhos. Ao adicionar um aparelho, escolha o cômodo correspondente para ter uma visão clara do consumo por ambiente.
            </p>
            <p className="text-lg mb-4">
              No cadastro de tarifas, informe os valores de TE e TSUD. Estes valores podem ser obtidos na sua conta de luz ou fornecidos pelo seu fornecedor de energia. Selecione o modo de tarifação:
            </p>
            <ul className="list-disc ml-6 text-lg mb-4">
              <li>
                <strong>Por Faixa de Consumo:</strong> Defina tarifas diferentes para faixas (ex.: 0-30 kWh, 30-100 kWh, etc.). O sistema calculará o custo multiplicando o consumo do aparelho pelo TE e TSUD da faixa correspondente.
              </li>
              <li>
                <strong>Tarifa Fixa:</strong> Utilize um par único de valores para TE e TSUD para todos os aparelhos.
              </li>
            </ul>
            <p className="text-lg mb-4">
              Você pode adicionar novas faixas ou removê-las conforme sua necessidade.
            </p>
          </motion.section>

          {/* Conquistas e Metas */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 1 }}
            className="mb-10"
          >
            <h2 className="text-2xl font-semibold mb-4">Conquistas e Metas</h2>
            <p className="text-lg mb-4">
              O sistema de conquistas premia suas ações no site. Você desbloqueará conquistas ao:
            </p>
            <ul className="list-disc ml-6 text-lg mb-4">
              <li>Inserir os valores das tarifas corretamente</li>
              <li>Adicionar seus aparelhos e configurar seu consumo de energia (verifique as especificações ou a etiqueta do produto)</li>
              <li>Criar locais e cômodos para organizar seus dados</li>
              <li>Economizar energia e reduzir seus custos</li>
              <li>Concluir metas e tarefas diárias, semanais e mensais</li>
            </ul>
            <p className="text-lg mb-4">
              As conquistas são progressivas: você só desbloqueará as próximas depois de cumprir os pré-requisitos das anteriores.
            </p>
          </motion.section>

          {/* Navegação com botão animado e efeito de brilho */}
          <motion.section
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 3, duration: 1 }}
            className="text-center"
          >
            <Link
              href="/"
              className="inline-block px-8 py-4 bg-[#00BFFF] text-white font-bold rounded-full hover:bg-[#009acd] hover:shadow-[0_0_20px_#00BFFF] transition duration-300"
            >
              Voltar para o Início
            </Link>
          </motion.section>
        </div>
      </div>
    </>
  );
}
