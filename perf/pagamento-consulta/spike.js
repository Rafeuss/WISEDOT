import { SPIKE } from '../lib/scenarios.js';
import { API_THRESHOLDS } from '../lib/thresholds.js';
import { boletoConsultaFlow } from '../lib/flows.js';
import { loginAndGetToken } from '../lib/requests.js';

export const options = { ...SPIKE, thresholds: API_THRESHOLDS };

export function setup() {
  return { token: loginAndGetToken() };
}

export default function (data) {
  boletoConsultaFlow(data.token);
}
