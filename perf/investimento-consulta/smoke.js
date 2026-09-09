import { SMOKE } from '../lib/scenarios.js';
import { API_THRESHOLDS } from '../lib/thresholds.js';
import { marketShareListFlow } from '../lib/flows.js';
import { loginAndGetToken } from '../lib/requests.js';

export const options = { ...SMOKE, thresholds: API_THRESHOLDS };

export function setup() {
  return { token: loginAndGetToken() };
}

export default function (data) {
  marketShareListFlow(data.token);
}
