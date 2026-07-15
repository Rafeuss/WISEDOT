import { AVERAGE_LOAD } from '../lib/scenarios.js';
import { API_THRESHOLDS } from '../lib/thresholds.js';
import { boletoConsultaFlow } from '../lib/flows.js';
import { loginAndGetToken } from '../lib/requests.js';

export const options = { ...AVERAGE_LOAD, thresholds: API_THRESHOLDS };

export function setup() {
  return { token: loginAndGetToken() };
}

export default function (data) {
  boletoConsultaFlow(data.token);
}
