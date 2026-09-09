import http from 'k6/http';
import { BASE_URL, SEED_USER } from './config.js';

export function loginRequest() {
  return http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ email: SEED_USER.email, password: SEED_USER.password }),
    { headers: { 'Content-Type': 'application/json' } },
  );
}

export function loginAndGetToken() {
  const body = JSON.parse(loginRequest().body);
  return body.data && body.data.token;
}

export function authHeaders(token) {
  return { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };
}
