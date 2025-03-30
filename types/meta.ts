export interface Meta {
    id: string;
    titulo: string;
    progresso: number;
    concluida: boolean;
    geradaEm?: Date;
  }
  
  export interface Usadas {
    semanais: string[];
    mensais: string[];
  }
  
  export interface UsuarioData {
    metas: {
      semanais: Meta[];
      mensais: Meta[];
    };
    metasUsadas: Usadas;
    historicoConcluidas: number;
  }
  