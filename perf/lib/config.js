// k6 roda em runtime proprio (goja), sem acesso ao Node.js e portanto sem
// acesso direto ao modulo db/ (que usa `pg`) usado pelas automacoes de UI/API.
// Por isso as credenciais do usuario de seed sao duplicadas aqui como
// constantes (devem ser mantidas em sincronia manual com db/testUser.js).
// Rode `npm run seed` na raiz do projeto ANTES de executar qualquer cenario
// de performance, garantindo que este usuario e saldo existam no banco.
export const BASE_URL = 'http://localhost:3000';

export const SEED_USER = {
  email: 'qa.seed.user@academywallet.test',
  password: 'Seed@Teste123',
};

export const BARCODE_SUCESSO = '34191751243456787123041234560005199890000015000';
