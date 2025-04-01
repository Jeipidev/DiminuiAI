export const conquistas = [
  // Metas
  { id: "meta-1", titulo: "Primeira Meta!", descricao: "Conclua sua primeira meta.", tipo: "metas", condicao: "1", dificuldade: "fácil" },
  { id: "meta-10", titulo: "Foco Total", descricao: "Conclua 10 metas.", tipo: "metas", condicao: "10", dificuldade: "médio", prev: "meta-1" },
  { id: "meta-30", titulo: "Maratonista de Metas", descricao: "Conclua 30 metas.", tipo: "metas", condicao: "30", dificuldade: "difícil", prev: "meta-10" },
  
  // Eletrônicos
  { id: "eletronicos-5", titulo: "Engenheiro Doméstico", descricao: "Adicione 5 eletrônicos.", tipo: "eletronicos", condicao: "5", dificuldade: "fácil" },
  { id: "eletronicos-10", titulo: "Museu de Eletros", descricao: "Adicione 10 eletrônicos.", tipo: "eletronicos", condicao: "10", dificuldade: "médio", prev: "eletronicos-5" },
  { id: "eletronicos-25", titulo: "Catálogo Completo", descricao: "Adicione 25 eletrônicos.", tipo: "eletronicos", condicao: "25", dificuldade: "médio", prev: "eletronicos-10" },
  { id: "eletronicos-50", titulo: "Engenharia de Elite", descricao: "Adicione 50 eletrônicos.", tipo: "eletronicos", condicao: "50", dificuldade: "difícil", prev: "eletronicos-25" },
  
  // Economia (progressão)
  { id: "economia-10", titulo: "Economista I", descricao: "Economize R$10.", tipo: "economia", condicao: "10", dificuldade: "fácil" },
  { id: "economia-50", titulo: "Economista II", descricao: "Economize R$50.", tipo: "economia", condicao: "50", dificuldade: "médio", prev: "economia-10" },
  { id: "economia-100", titulo: "Economista III", descricao: "Economize R$100.", tipo: "economia", condicao: "100", dificuldade: "difícil", prev: "economia-50" },
  { id: "economia-500", titulo: "Ultra Economista", descricao: "Economize mais de R$500 no total.", tipo: "economia", condicao: "500", dificuldade: "difícil", prev: "economia-100" },
  
  // Consumo
  { id: "consumo-50", titulo: "Caça Desperdício", descricao: "Economize mais de 50 kWh.", tipo: "consumo", condicao: "50", dificuldade: "difícil" },
  { id: "consumo-200", titulo: "Economia Total", descricao: "Economize mais de 200 kWh.", tipo: "consumo", condicao: "200", dificuldade: "difícil", prev: "consumo-50" },
  
  // Tarifas
  { id: "tarifas-3", titulo: "Tarifa Ninja", descricao: "Adicione mais de 3 tarifas.", tipo: "tarifas", condicao: "3", dificuldade: "fácil" },
  { id: "tarifas-10", titulo: "Rei das Tarifas", descricao: "Adicione 10 tarifas.", tipo: "tarifas", condicao: "10", dificuldade: "médio", prev: "tarifas-3" },
  
  // Combo
  { id: "combo-1", titulo: "Tudo no Controle", descricao: "Tenha metas, tarifas e eletrônicos ativos.", tipo: "combo", condicao: "all", dificuldade: "médio" },
  
  // Semanal
  { id: "semanal-4", titulo: "Rotina Brilhante", descricao: "Conclua uma meta semanal por 4 semanas seguidas.", tipo: "semanal", condicao: "4x consecutivas", dificuldade: "médio" },
  { id: "semanal-12", titulo: "Constância Total", descricao: "Conclua metas semanais por 12 semanas.", tipo: "semanal", condicao: "12x consecutivas", dificuldade: "médio", prev: "semanal-4" },
  
  // Novos: Locais e Cômodos
  { id: "locais-1", titulo: "Primeiro Local", descricao: "Adicione o seu primeiro local.", tipo: "locais", condicao: "1", dificuldade: "fácil" },
  { id: "locais-5", titulo: "Expansão Doméstica", descricao: "Adicione 5 locais.", tipo: "locais", condicao: "5", dificuldade: "médio", prev: "locais-1" },
  
  { id: "comodos-1", titulo: "Primeiro Cômodo", descricao: "Crie seu primeiro cômodo.", tipo: "comodos", condicao: "1", dificuldade: "fácil" },
  { id: "comodos-5", titulo: "Ambientes Organizados", descricao: "Crie 5 cômodos.", tipo: "comodos", condicao: "5", dificuldade: "médio", prev: "comodos-1" },
  
  // Geral
  { id: "geral-1", titulo: "Primeiros Passos", descricao: "Complete qualquer ação no sistema.", tipo: "geral", condicao: "1", dificuldade: "fácil" },
];
