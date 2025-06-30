'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome,
  FiTarget,
  FiAward,
  FiBookOpen,
  FiDollarSign,
  FiLogOut,
  FiMenu,
  FiX,
  FiUser,
  FiChevronDown,
  FiZap,
  FiSettings,
  FiMoon,
  FiSun,
  FiBell,
  FiSearch
} from 'react-icons/fi';

interface HeaderProps {
  nome: string;
  exibirBoasVindas?: boolean;
  children?: React.ReactNode;
}

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  color: string;
  description?: string;
}

export default function Header({ nome, exibirBoasVindas = true, children }: HeaderProps) {
  const [menuAberto, setMenuAberto] = useState(false);
  const [userMenuAberto, setUserMenuAberto] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Detectar scroll para efeito no header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fechar menus ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuAberto(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuAberto(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems: MenuItem[] = [
    {
      icon: <FiHome />,
      label: 'Dashboard',
      path: '/dashboard',
      color: 'blue',
      description: 'Visão geral dos seus dados'
    },
    {
      icon: <FiTarget />,
      label: 'Metas',
      path: '/metas',
      color: 'red',
      description: 'Acompanhe seus objetivos'
    },
    {
      icon: <FiAward />,
      label: 'Conquistas',
      path: '/perfil',
      color: 'yellow',
      description: 'Suas conquistas desbloqueadas'
    },
    {
      icon: <FiDollarSign />,
      label: 'Contas',
      path: '/contas',
      color: 'green',
      description: 'Registre suas contas de energia'
    },
    {
      icon: <FiBookOpen />,
      label: 'Tutorial',
      path: '/dashboard/tutorial',
      color: 'purple',
      description: 'Aprenda a usar a plataforma'
    }
  ];

  const sair = async () => {
    await signOut(auth);
    router.push('/');
  };

  const navigateTo = (path: string) => {
    router.push(path);
    setMenuAberto(false);
    setUserMenuAberto(false);
  };

  const getActiveColor = (path: string) => {
    return pathname === path ? 'text-blue-400' : 'text-slate-400';
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-slate-900/95 backdrop-blur-xl border-b border-white/20 shadow-2xl' 
          : 'bg-slate-900/80 backdrop-blur-md border-b border-white/10'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo e Título */}
          <motion.div 
            className="flex items-center gap-4"
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                <FiZap className="text-white text-xl" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse"></div>
            </div>
            
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                EcoQuest
              </h1>
              {exibirBoasVindas && (
                <p className="text-sm text-slate-400">
                  Olá, <span className="text-white font-medium">{nome.split(' ')[0]}</span>
                </p>
              )}
            </div>
          </motion.div>

          {/* Navegação Central - Desktop */}
          <nav className="hidden md:flex items-center gap-2">
            {menuItems.map((item) => (
              <motion.button
                key={item.path}
                onClick={() => navigateTo(item.path)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                  pathname === item.path
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </motion.button>
            ))}
          </nav>

          {/* Área do Usuário */}
          <div className="flex items-center gap-3">
            {/* Botão de Notificações */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 group"
            >
              <FiBell className="text-slate-400 group-hover:text-white transition-colors" />
              <div className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full"></div>
            </motion.button>

            {/* Menu do Usuário */}
            <div className="relative" ref={userMenuRef}>
              <motion.button
                onClick={() => setUserMenuAberto(!userMenuAberto)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                  {getUserInitials(nome)}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-white">
                    {nome.split(' ')[0]}
                  </p>
                  <p className="text-xs text-slate-400">
                    {nome.split('@')[0]}
                  </p>
                </div>
                <FiChevronDown className={`text-slate-400 transition-transform duration-300 ${userMenuAberto ? 'rotate-180' : ''}`} />
              </motion.button>

              {/* Dropdown do Usuário */}
              <AnimatePresence>
                {userMenuAberto && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-72 bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                  >
                    {/* Header do Menu */}
                    <div className="p-4 border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
                          {getUserInitials(nome)}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{nome}</p>
                          <p className="text-sm text-slate-400">Usuário Premium</p>
                        </div>
                      </div>
                    </div>

                    {/* Opções do Menu */}
                    <div className="p-2">
                      <button
                        onClick={() => navigateTo('/perfil')}
                        className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:bg-white/10 transition-all duration-300 group"
                      >
                        <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                          <FiUser className="text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">Meu Perfil</p>
                          <p className="text-xs text-slate-400">Gerencie sua conta</p>
                        </div>
                      </button>

                      <button
                        onClick={() => navigateTo('/dashboard')}
                        className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:bg-white/10 transition-all duration-300 group"
                      >
                        <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                          <FiSettings className="text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">Configurações</p>
                          <p className="text-xs text-slate-400">Personalize sua experiência</p>
                        </div>
                      </button>

                      <div className="border-t border-white/10 my-2"></div>

                      <button
                        onClick={sair}
                        className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:bg-red-500/10 transition-all duration-300 group"
                      >
                        <div className="p-2 bg-red-500/20 rounded-lg group-hover:bg-red-500/30 transition-colors">
                          <FiLogOut className="text-red-400" />
                        </div>
                        <div>
                          <p className="font-medium text-red-400">Sair da Conta</p>
                          <p className="text-xs text-slate-400">Fazer logout do sistema</p>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Menu Mobile */}
            <div className="md:hidden" ref={menuRef}>
              <motion.button
                onClick={() => setMenuAberto(!menuAberto)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300"
              >
                <AnimatePresence mode="wait">
                  {menuAberto ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90 }}
                      animate={{ rotate: 0 }}
                      exit={{ rotate: 90 }}
                    >
                      <FiX className="text-white" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90 }}
                      animate={{ rotate: 0 }}
                      exit={{ rotate: -90 }}
                    >
                      <FiMenu className="text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Menu Mobile Dropdown */}
              <AnimatePresence>
                {menuAberto && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-4 mt-2 w-80 bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                  >
                    <div className="p-2">
                      {menuItems.map((item, index) => (
                        <motion.button
                          key={item.path}
                          onClick={() => navigateTo(item.path)}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-300 group ${
                            pathname === item.path
                              ? 'bg-blue-500/20 border border-blue-500/30'
                              : 'hover:bg-white/10'
                          }`}
                        >
                          <div className={`p-3 rounded-xl ${
                            pathname === item.path
                              ? `bg-${item.color}-500/30`
                              : `bg-${item.color}-500/20 group-hover:bg-${item.color}-500/30`
                          } transition-colors`}>
                            <span className={`text-${item.color}-400 text-lg`}>
                              {item.icon}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className={`font-semibold ${
                              pathname === item.path ? 'text-blue-400' : 'text-white'
                            }`}>
                              {item.label}
                            </p>
                            {item.description && (
                              <p className="text-xs text-slate-400 mt-1">
                                {item.description}
                              </p>
                            )}
                          </div>
                          {pathname === item.path && (
                            <motion.div
                              layoutId="activeIndicator"
                              className="w-2 h-2 bg-blue-400 rounded-full"
                            />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {children}
        </div>
      </div>
    </motion.header>
  );
}