// Thresholds compartilhados para os cenarios de performance de API,
// conforme especificado no projeto de certificacao.
export const API_THRESHOLDS = {
  http_req_duration: ['p(95)<500'],
  http_req_failed: ['rate<0.01'],
  checks: ['rate>0.95'],
};
