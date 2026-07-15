import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL, BARCODE_SUCESSO } from './config.js';
import { authHeaders, loginRequest } from './requests.js';

// Fluxos reutilizados pelos cenarios de cada modulo (smoke/average/soak/
// stress/breakpoint/spike so alteram VUs e duracao, nao a logica da requisicao
// em si - por isso ela fica centralizada aqui, evitando duplicidade).

export function loginFlow() {
  const res = loginRequest();

  check(res, {
    'login: status 200': (r) => r.status === 200,
    'login: token presente': (r) => {
      const body = JSON.parse(r.body);
      return Boolean(body.data && body.data.token);
    },
  });
}

export function boletoConsultaFlow(token) {
  const res = http.get(`${BASE_URL}/paid-slips/${BARCODE_SUCESSO}`, authHeaders(token));

  check(res, {
    'consulta boleto: status 200': (r) => r.status === 200,
    'consulta boleto: possui valor': (r) => {
      const body = JSON.parse(r.body);
      return Boolean(body.data && body.data.valueToPay !== undefined);
    },
  });
}

export function marketShareListFlow(token) {
  const res = http.get(`${BASE_URL}/market-share`, authHeaders(token));

  check(res, {
    'market-share: status 200': (r) => r.status === 200,
    'market-share: possui dados': (r) => {
      const body = JSON.parse(r.body);
      return Boolean(body.data && Array.isArray(body.data.data));
    },
  });
}
