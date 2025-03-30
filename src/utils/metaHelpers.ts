import { bancoDeMetas } from './bancometas';
import { Meta } from '../../types/meta';

export const sortearNovaMeta = (tipo: 'semanais' | 'mensais', usadas: string[]): Meta => {
  const pool = bancoDeMetas[tipo].filter(m => !usadas.includes(m.id));
  const fallback = bancoDeMetas[tipo][Math.floor(Math.random() * bancoDeMetas[tipo].length)];
  const nova = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : fallback;
  return nova;
};

export const podeTrocarMeta = (meta: Meta, tipo: 'semanais' | 'mensais'): boolean => {
  if (!meta.geradaEm) return false;
  const dataGerada = meta.geradaEm instanceof Date ? meta.geradaEm : new Date(meta.geradaEm);
  const diffDias = (Date.now() - dataGerada.getTime()) / (1000 * 3600 * 24);
  return diffDias >= (tipo === 'semanais' ? 7 : 30);
};
