export interface Meta {
    id: string;
    titulo: string;
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
  