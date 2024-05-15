export interface voto {
    id: string;
    idUsuario: string;
    idMaestro: string;
    puntuacion: number;
  }
  
  export const votosIniciales : voto[] = [
    {
      id:'a',
      idUsuario: '105387bbdj83',
      idMaestro: '265387bddd4f',
      puntuacion: 1
    }
  ]