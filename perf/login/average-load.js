import { AVERAGE_LOAD } from '../lib/scenarios.js';
import { API_THRESHOLDS } from '../lib/thresholds.js';
import { loginFlow } from '../lib/flows.js';

export const options = { ...AVERAGE_LOAD, thresholds: API_THRESHOLDS };

export default function () {
  loginFlow();
}
