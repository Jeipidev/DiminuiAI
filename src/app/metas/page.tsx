'use client';
import { useEffect, useState } from 'react';
import { auth } from '../../../firebase';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, getFirestore } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiTarget, 
  FiCheckCircle, 
  FiCalendar, 
  FiTrendingUp, 
  FiClock, 
  FiAward, 
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiStar,
  FiZap,
  FiDollarSign,
  FiBarChart,
  FiPlay,
  FiPause,
  FiRotateCcw,
  FiFlag,
  FiTrendingDown,
  FiAlertCircle,
  FiX
} from 'react-icons/fi';
import Header from '@/components/Header';
import { BiLeaf } from 'react-icons/bi';

const db = getFirestore();

interface CustomMeta {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  tipoMeta: 'economia' | 'reducao' | 'tempo' | 'custom';
  valorAtual: number;
  valorObjetivo: number;
  unidade: string;
  dataInicio: string;
  dataLimite: string;
  status: 'ativa' | 'pausada' | 'concluida' | 'expirada';
  cor: string;
  icone: string;
  criadaEm: Date;
  ultimaAtualizacao: Date;
  marcos: Marco[];
  historico: HistoricoProgresso[];
  recompensa?: string;
  dificuldade: 'facil' | 'medio' | 'dificil';
}

interface Marco {
  id: string;
  nome: string;
  valor: number;
  concluido: boolean;
  dataConclusao?: Date;
}

interface HistoricoProgresso {
  id: string;
  data: Date;
  valor: number;
  observacao?: string;
}

export default function CustomMetasPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [metas, setMetas] = useState<CustomMeta[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingMeta, setEditingMeta] = useState<CustomMeta | null>(null);
  const [showProgressModal, setShowProgressModal] = useState<CustomMeta | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>('todas');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const router = useRouter();

  // Formulário para nova meta
  const [novaMetaForm, setNovaMetaForm] = useState({
    titulo: '',
    descricao: '',
    categoria: 'economia',
    tipoMeta: 'economia' as const,
    valorObjetivo: 0,
    unidade: 'R$',
    dataLimite: '',
    cor: '#3b82f6',
    icone: 'FiDollarSign',
    recompensa: '',
    dificuldade: 'medio' as const,
    marcos: [] as string[]
  });

  const [progressoForm, setProgressoForm] = useState({
    valor: 0,
    observacao: ''
  });

  const categorias = [
    { id: 'economia', nome: 'Economia de Dinheiro', cor: '#22c55e', icone: 'FiDollarSign' },
    { id: 'energia', nome: 'Redução de Energia', cor: '#3b82f6', icone: 'FiZap' },
    { id: 'sustentabilidade', nome: 'Sustentabilidade', cor: '#10b981', icone: 'FiLeaf' },
    { id: 'eficiencia', nome: 'Eficiência', cor: '#8b5cf6', icone: 'FiTrendingUp' },
    { id: 'habitos', nome: 'Mudança de Hábitos', cor: '#f59e0b', icone: 'FiTarget' },
    { id: 'personalizada', nome: 'Personalizada', cor: '#ef4444', icone: 'FiStar' }
  ];

  const icones = [
    'FiDollarSign', 'FiZap', 'FiLeaf', 'FiTrendingUp', 'FiTarget', 'FiStar',
    'FiBarChart3', 'FiClock', 'FiAward', 'FiTrendingDown', 'FiFlag'
  ];

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      FiDollarSign, FiZap, BiLeaf, FiTrendingUp, FiTarget, FiStar,
      FiBarChart, FiClock, FiAward, FiTrendingDown, FiFlag
    };
    return iconMap[iconName] || FiTarget;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!u) return router.push('/login');
      setUser(u);
      await carregarMetas(u.uid);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const carregarMetas = async (userId: string) => {
    const ref = doc(db, 'usuarios', userId);
    const snap = await getDoc(ref);
    const data = snap.exists() ? snap.data() : {};
    setMetas(data.customMetas || []);
  };

  const salvarMetas = async (novasMetas: CustomMeta[]) => {
    if (!user) return;
    await setDoc(doc(db, 'usuarios', user.uid), {
      customMetas: novasMetas
    }, { merge: true });
    setMetas(novasMetas);
  };

  const criarMeta = async () => {
    if (!novaMetaForm.titulo.trim() || !novaMetaForm.dataLimite) return;

    const novaMeta: CustomMeta = {
      id: Math.random().toString(36).substr(2, 9),
      titulo: novaMetaForm.titulo,
      descricao: novaMetaForm.descricao,
      categoria: novaMetaForm.categoria,
      tipoMeta: novaMetaForm.tipoMeta,
      valorAtual: 0,
      valorObjetivo: novaMetaForm.valorObjetivo,
      unidade: novaMetaForm.unidade,
      dataInicio: new Date().toISOString(),
      dataLimite: novaMetaForm.dataLimite,
      status: 'ativa',
      cor: novaMetaForm.cor,
      icone: novaMetaForm.icone,
      criadaEm: new Date(),
      ultimaAtualizacao: new Date(),
      marcos: novaMetaForm.marcos.map((nome, index) => ({
        id: Math.random().toString(36).substr(2, 9),
        nome,
        valor: (novaMetaForm.valorObjetivo / novaMetaForm.marcos.length) * (index + 1),
        concluido: false
      })),
      historico: [],
      recompensa: novaMetaForm.recompensa,
      dificuldade: novaMetaForm.dificuldade
    };

    const novasMetas = [...metas, novaMeta];
    await salvarMetas(novasMetas);
    setShowCreateForm(false);
    resetForm();
  };

  const atualizarProgresso = async (metaId: string) => {
    if (!progressoForm.valor) return;

    const metasAtualizadas = metas.map(meta => {
      if (meta.id === metaId) {
        const novoValor = meta.valorAtual + progressoForm.valor;
        const porcentagem = (novoValor / meta.valorObjetivo) * 100;
        
        // Atualizar marcos
        const marcosAtualizados = meta.marcos.map(marco => {
          if (!marco.concluido && novoValor >= marco.valor) {
            return { ...marco, concluido: true, dataConclusao: new Date() };
          }
          return marco;
        });

        // Adicionar ao histórico
        const novoHistorico = [...meta.historico, {
          id: Math.random().toString(36).substr(2, 9),
          data: new Date(),
          valor: progressoForm.valor,
          observacao: progressoForm.observacao
        }];

        return {
          ...meta,
          valorAtual: novoValor,
          status: porcentagem >= 100 ? 'concluida' as const : meta.status,
          marcos: marcosAtualizados,
          historico: novoHistorico,
          ultimaAtualizacao: new Date()
        };
      }
      return meta;
    });

    await salvarMetas(metasAtualizadas);
    setShowProgressModal(null);
    setProgressoForm({ valor: 0, observacao: '' });
  };

  const alterarStatusMeta = async (metaId: string, novoStatus: CustomMeta['status']) => {
    const metasAtualizadas = metas.map(meta => 
      meta.id === metaId 
        ? { ...meta, status: novoStatus, ultimaAtualizacao: new Date() }
        : meta
    );
    await salvarMetas(metasAtualizadas);
  };

  const excluirMeta = async (metaId: string) => {
    const metasAtualizadas = metas.filter(meta => meta.id !== metaId);
    await salvarMetas(metasAtualizadas);
  };

  const resetForm = () => {
    setNovaMetaForm({
      titulo: '',
      descricao: '',
      categoria: 'economia',
      tipoMeta: 'economia',
      valorObjetivo: 0,
      unidade: 'R$',
      dataLimite: '',
      cor: '#3b82f6',
      icone: 'FiDollarSign',
      recompensa: '',
      dificuldade: 'medio',
      marcos: []
    });
  };

  const calcularDiasRestantes = (dataLimite: string) => {
    const hoje = new Date();
    const limite = new Date(dataLimite);
    const diffTime = limite.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const obterCorStatus = (status: string) => {
    switch (status) {
      case 'ativa': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'pausada': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'concluida': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'expirada': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const metasFiltradas = metas.filter(meta => {
    const passaStatus = filtroStatus === 'todas' || meta.status === filtroStatus;
    const passaCategoria = filtroCategoria === 'todas' || meta.categoria === filtroCategoria;
    return passaStatus && passaCategoria;
  });

  const estatisticas = {
    total: metas.length,
    ativas: metas.filter(m => m.status === 'ativa').length,
    concluidas: metas.filter(m => m.status === 'concluida').length,
    emAndamento: metas.filter(m => m.valorAtual > 0 && m.status === 'ativa').length
  };

  if (loading) 
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando suas metas...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen pt-[80px] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 space-y-8">
      <Header nome={user?.displayName || user?.email} />
      <div className="container mx-auto max-w-7xl">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Minhas Metas Pessoais
          </h1>
          <p className="text-slate-400 text-lg">Crie e acompanhe suas metas de economia e sustentabilidade</p>
        </motion.div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total', value: estatisticas.total, icon: <FiTarget />, color: 'blue' },
            { label: 'Ativas', value: estatisticas.ativas, icon: <FiPlay />, color: 'green' },
            { label: 'Concluídas', value: estatisticas.concluidas, icon: <FiCheckCircle />, color: 'emerald' },
            { label: 'Em Progresso', value: estatisticas.emAndamento, icon: <FiTrendingUp />, color: 'purple' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-${stat.color}-500/10 backdrop-blur-xl border border-${stat.color}-500/30 p-6 rounded-3xl`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-3 bg-${stat.color}-500/20 rounded-xl`}>
                  <span className={`text-${stat.color}-400 text-xl`}>{stat.icon}</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-slate-400 text-sm">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filtros e Botão Criar */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="px-4 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none"
            >
              <option value="todas">Todos os Status</option>
              <option value="ativa">Ativas</option>
              <option value="pausada">Pausadas</option>
              <option value="concluida">Concluídas</option>
              <option value="expirada">Expiradas</option>
            </select>

            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="px-4 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none"
            >
              <option value="todas">Todas as Categorias</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nome}</option>
              ))}
            </select>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-blue-500/25 transition-all duration-300 flex items-center gap-2"
          >
            <FiPlus /> Nova Meta
          </motion.button>
        </div>

        {/* Lista de Metas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {metasFiltradas.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <FiTarget className="mx-auto text-6xl text-slate-600 mb-4" />
              <p className="text-slate-400 text-lg">Nenhuma meta encontrada</p>
              <p className="text-slate-500">Crie sua primeira meta personalizada!</p>
            </div>
          ) : (
            metasFiltradas.map((meta, index) => (
              <MetaCard
                key={meta.id}
                meta={meta}
                index={index}
                onUpdateProgress={() => setShowProgressModal(meta)}
                onChangeStatus={alterarStatusMeta}
                onEdit={() => setEditingMeta(meta)}
                onDelete={excluirMeta}
                calcularDiasRestantes={calcularDiasRestantes}
                obterCorStatus={obterCorStatus}
                getIconComponent={getIconComponent}
              />
            ))
          )}
        </div>

        {/* Modal Criar Meta */}
        <AnimatePresence>
          {showCreateForm && (
            <CreateMetaModal
              form={novaMetaForm}
              setForm={setNovaMetaForm}
              categorias={categorias}
              icones={icones}
              onSubmit={criarMeta}
              onClose={() => {
                setShowCreateForm(false);
                resetForm();
              }}
            />
          )}
        </AnimatePresence>

        {/* Modal Progresso */}
        <AnimatePresence>
          {showProgressModal && (
            <ProgressModal
              meta={showProgressModal}
              form={progressoForm}
              setForm={setProgressoForm}
              onSubmit={() => atualizarProgresso(showProgressModal.id)}
              onClose={() => setShowProgressModal(null)}
              getIconComponent={getIconComponent}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Componente Card da Meta
function MetaCard({ 
  meta, 
  index, 
  onUpdateProgress, 
  onChangeStatus, 
  onEdit, 
  onDelete, 
  calcularDiasRestantes,
  obterCorStatus,
  getIconComponent 
}: any) {
  const IconComponent = getIconComponent(meta.icone);
  const porcentagem = (meta.valorAtual / meta.valorObjetivo) * 100;
  const diasRestantes = calcularDiasRestantes(meta.dataLimite);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden group hover:border-white/20 transition-all duration-300"
    >
      {/* Header do Card */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="p-3 rounded-xl"
              style={{ backgroundColor: `${meta.cor}20` }}
            >
              <IconComponent 
                className="text-xl" 
                style={{ color: meta.cor }} 
              />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{meta.titulo}</h3>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${obterCorStatus(meta.status)}`}>
                {meta.status.charAt(0).toUpperCase() + meta.status.slice(1)}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onUpdateProgress}
              className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
              disabled={meta.status !== 'ativa'}
            >
              <FiTrendingUp className="text-blue-400 text-sm" />
            </button>
            <button
              onClick={() => onEdit()}
              className="p-2 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg transition-colors"
            >
              <FiEdit3 className="text-yellow-400 text-sm" />
            </button>
            <button
              onClick={() => onDelete(meta.id)}
              className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
            >
              <FiTrash2 className="text-red-400 text-sm" />
            </button>
          </div>
        </div>

        {meta.descricao && (
          <p className="text-slate-400 text-sm mb-4">{meta.descricao}</p>
        )}

        {/* Progresso */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-400">Progresso</span>
            <span className="text-sm font-medium text-white">
              {meta.valorAtual.toLocaleString()} / {meta.valorObjetivo.toLocaleString()} {meta.unidade}
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(porcentagem, 100)}%` }}
              transition={{ duration: 1, delay: index * 0.1 }}
              className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-slate-500">
              {porcentagem.toFixed(1)}% concluído
            </span>
            <span className={`text-xs ${diasRestantes <= 7 ? 'text-red-400' : diasRestantes <= 30 ? 'text-yellow-400' : 'text-green-400'}`}>
              {diasRestantes > 0 ? `${diasRestantes} dias restantes` : 'Expirada'}
            </span>
          </div>
        </div>

        {/* Marcos */}
        {meta.marcos.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-slate-400 mb-2">Marcos</p>
            <div className="flex gap-2">
              {meta.marcos.map((marco: any) => (
                <div
                  key={marco.id}
                  className={`w-3 h-3 rounded-full ${
                    marco.concluido ? 'bg-green-400' : 'bg-white/20'
                  }`}
                  title={`${marco.nome} - ${marco.valor} ${meta.unidade}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Ações */}
        {meta.status === 'ativa' && (
          <div className="flex gap-2">
            <button
              onClick={() => onChangeStatus(meta.id, 'pausada')}
              className="flex-1 px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors text-sm flex items-center justify-center gap-2"
            >
              <FiPause className="text-xs" />
              Pausar
            </button>
            <button
              onClick={onUpdateProgress}
              className="flex-1 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm flex items-center justify-center gap-2"
            >
              <FiTrendingUp className="text-xs" />
              Progresso
            </button>
          </div>
        )}

        {meta.status === 'pausada' && (
          <button
            onClick={() => onChangeStatus(meta.id, 'ativa')}
            className="w-full px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm flex items-center justify-center gap-2"
          >
            <FiPlay className="text-xs" />
            Retomar
          </button>
        )}

        {meta.status === 'concluida' && meta.recompensa && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <FiAward className="text-green-400" />
              <span className="text-green-400 text-sm font-medium">Recompensa:</span>
            </div>
            <p className="text-green-300 text-sm mt-1">{meta.recompensa}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

const getIconComponent = (iconName: string) => {
  const iconMap: { [key: string]: any } = {
    FiDollarSign, 
    FiZap, 
    BiLeaf, 
    FiTrendingUp, 
    FiTarget, 
    FiStar,
    FiBarChart, 
    FiClock, 
    FiAward, 
    FiTrendingDown, 
    FiFlag
  };
  return iconMap[iconName] || FiTarget;
};

// Modal para criar nova meta
function CreateMetaModal({ form, setForm, categorias, icones, onSubmit, onClose }: any) {
  const [novoMarco, setNovoMarco] = useState('');

  const adicionarMarco = () => {
    if (novoMarco.trim()) {
      setForm({ ...form, marcos: [...form.marcos, novoMarco.trim()] });
      setNovoMarco('');
    }
  };

  const removerMarco = (index: number) => {
    setForm({ ...form, marcos: form.marcos.filter((_: string, i: number) => i !== index) });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Criar Nova Meta</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <FiX className="text-white" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Título da Meta</label>
              <input
                type="text"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                placeholder="Ex: Economizar R$ 500 este mês"
                className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Categoria</label>
              <select
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none"
              >
                {categorias.map((cat: any) => (
                  <option className="bg-slate-800 text-white" key={cat.id} value={cat.id}>{cat.nome}</option>
                ))}
                </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Descrição (opcional)</label>
            <textarea
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              placeholder="Descreva sua meta em detalhes..."
              rows={3}
              className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none resize-none"
            />
          </div>

          {/* Objetivo e Unidade */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Valor Objetivo</label>
              <input
                type="number"
                value={form.valorObjetivo}
                onChange={(e) => setForm({ ...form, valorObjetivo: parseFloat(e.target.value) || 0 })}
                placeholder="100"
                className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Unidade</label>
              <select
                value={form.unidade}
                onChange={(e) => setForm({ ...form, unidade: e.target.value })}
                className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none"
              >
                <option className="bg-slate-800 text-white" value="R$">Reais (R$)</option>
                <option className="bg-slate-800 text-white" value="kWh">Quilowatt-hora (kWh)</option>
                <option className="bg-slate-800 text-white" value="%">Porcentagem (%)</option>
                <option className="bg-slate-800 text-white" value="dias">Dias</option>
                <option className="bg-slate-800 text-white" value="horas">Horas</option>
                <option className="bg-slate-800 text-white" value="kg">Quilogramas (kg)</option>
                <option className="bg-slate-800 text-white" value="litros">Litros</option>
                <option className="bg-slate-800 text-white" value="unidades">Unidades</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Data Limite</label>
              <input
                type="date"
                value={form.dataLimite}
                onChange={(e) => setForm({ ...form, dataLimite: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none"
              />
            </div>
          </div>

          {/* Personalização Visual */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Cor</label>
              <div className="flex gap-3">
                {['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'].map(cor => (
                  <button
                    key={cor}
                    type="button"
                    onClick={() => setForm({ ...form, cor })}
                    className={`w-10 h-10 rounded-xl border-2 transition-all ${
                      form.cor === cor ? 'border-white scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: cor }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Ícone</label>
              <div className="grid grid-cols-6 gap-3">
                {icones.map((icone: string) => {
                  const IconComponent = getIconComponent(icone);
                  return (
                  <button
                  key={icone}
                  type="button"
                  onClick={() => setForm({ ...form, icone })}
                  className={`p-3  rounded-xl border-2 transition-all hover:scale-110 ${
                    form.icone === icone 
                    ? 'border-blue-400 bg-blue-500/20' 
                    : 'border-white/20 bg-white/5 hover:border-white/40'
                  }`}
                  >
                    <IconComponent className="text-xl text-white mx-auto" />
                    </button>
                    );
                    })}
                    </div>
                </div>
              </div>

          {/* Dificuldade e Recompensa */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Dificuldade</label>
              <select
                value={form.dificuldade}
                onChange={(e) => setForm({ ...form, dificuldade: e.target.value as any })}
                className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none"
              >
                <option className="bg-slate-800 text-white" value="facil">Fácil</option>
                <option className="bg-slate-800 text-white" value="medio">Médio</option>
                <option className="bg-slate-800 text-white" value="dificil">Difícil</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Recompensa (opcional)</label>
              <input
                type="text"
                value={form.recompensa}
                onChange={(e) => setForm({ ...form, recompensa: e.target.value })}
                placeholder="Ex: Jantar especial"
                className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none"
              />
            </div>
          </div>

          {/* Marcos */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Marcos (opcional)</label>
            <div className="space-y-3">
              {form.marcos.map((marco: string, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                  <span className="flex-1 text-white">{marco}</span>
                  <button
                    type="button"
                    onClick={() => removerMarco(index)}
                    className="p-1 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <FiX className="text-sm" />
                  </button>
                </div>
              ))}
              
              <div className="flex gap-3">
                <input
                  type="text"
                  value={novoMarco}
                  onChange={(e) => setNovoMarco(e.target.value)}
                  placeholder="Nome do marco"
                  className="flex-1 p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && adicionarMarco()}
                />
                <button
                  type="button"
                  onClick={adicionarMarco}
                  className="px-4 py-3 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 transition-colors"
                >
                  <FiPlus />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onSubmit}
            disabled={!form.titulo.trim() || !form.dataLimite || form.valorObjetivo <= 0}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Criar Meta
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Modal para atualizar progresso
function ProgressModal({ meta, form, setForm, onSubmit, onClose, getIconComponent }: any) {
  const IconComponent = getIconComponent(meta.icone);
  const porcentagemAtual = (meta.valorAtual / meta.valorObjetivo) * 100;
  const novaPorcentagem = ((meta.valorAtual + form.valor) / meta.valorObjetivo) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-lg w-full"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div 
              className="p-3 rounded-xl"
              style={{ backgroundColor: `${meta.cor}20` }}
            >
              <IconComponent 
                className="text-xl" 
                style={{ color: meta.cor }} 
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{meta.titulo}</h2>
              <p className="text-slate-400 text-sm">Atualizar progresso</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <FiX className="text-white" />
          </button>
        </div>

        {/* Progresso Atual */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-400">Progresso Atual</span>
            <span className="text-sm font-medium text-white">
              {meta.valorAtual.toLocaleString()} / {meta.valorObjetivo.toLocaleString()} {meta.unidade}
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3 mb-2">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
              style={{ width: `${Math.min(porcentagemAtual, 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-500">{porcentagemAtual.toFixed(1)}% concluído</p>
        </div>

        {/* Formulário */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Adicionar ao Progresso ({meta.unidade})
            </label>
            <input
              type="number"
              value={form.valor}
              onChange={(e) => setForm({ ...form, valor: parseFloat(e.target.value) || 0 })}
              placeholder="0"
              min="0"
              className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Observação (opcional)
            </label>
            <textarea
              value={form.observacao}
              onChange={(e) => setForm({ ...form, observacao: e.target.value })}
              placeholder="Adicione uma nota sobre este progresso..."
              rows={3}
              className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none resize-none"
            />
          </div>

          {/* Preview do Novo Progresso */}
          {form.valor > 0 && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-blue-400">Novo Progresso</span>
                <span className="text-sm font-medium text-white">
                  {(meta.valorAtual + form.valor).toLocaleString()} / {meta.valorObjetivo.toLocaleString()} {meta.unidade}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3 mb-2">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                  style={{ width: `${Math.min(novaPorcentagem, 100)}%` }}
                />
              </div>
              <p className="text-xs text-blue-300">
                {novaPorcentagem.toFixed(1)}% concluído 
                {novaPorcentagem >= 100 && (
                  <span className="ml-2 text-green-400 font-medium">🎉 Meta Concluída!</span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Histórico Recente */}
        {meta.historico.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Últimas Atualizações</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {meta.historico.slice(-3).reverse().map((entrada: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                  <span className="text-sm text-white">+{entrada.valor} {meta.unidade}</span>
                  <span className="text-xs text-slate-400">
                    {new Date(entrada.data).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botões */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onSubmit}
            disabled={form.valor <= 0}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-green-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Atualizar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}