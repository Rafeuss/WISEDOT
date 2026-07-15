// Configuracoes de cenario centralizadas (evita duplicar os mesmos stages/vus
// em cada um dos arquivos de teste por fluxo). Valores conforme especificado
// no projeto de certificacao.

export const SMOKE = {
  vus: 5,
  duration: '30s',
};

export const AVERAGE_LOAD = {
  vus: 7,
  duration: '45s',
};

export const SOAK = {
  vus: 7,
  duration: '2m',
};

export const STRESS = {
  stages: [
    { duration: '15s', target: 10 },
    { duration: '30s', target: 10 },
    { duration: '15s', target: 0 },
  ],
};

export const BREAKPOINT = {
  vus: 30,
  duration: '30s',
};

export const SPIKE = {
  stages: [
    { duration: '5s', target: 30 },
    { duration: '2s', target: 0 },
  ],
};
