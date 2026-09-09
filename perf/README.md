# Testing Pattern — Performance (k6)

Equivalente ao Page Object Model usado em `gui/` e `api/`, aplicado a k6: cada
responsabilidade fica isolada em sua própria camada, e os arquivos de cenário
(`smoke.js`, `stress.js` etc.) só compõem essas camadas — nunca implementam
requisição ou lógica de negócio diretamente.

## Camadas (`perf/lib/`)

- **`config.js`** — constantes compartilhadas (URL base, usuário de seed, dados de teste).
- **`requests.js`** — chamadas HTTP de baixo nível reutilizáveis (`loginRequest`,
  `loginAndGetToken`, `authHeaders`). Sem `check()` aqui — isso é responsabilidade do fluxo.
- **`flows.js`** — fluxos de negócio (`loginFlow`, `boletoConsultaFlow`,
  `marketShareListFlow`): fazem a requisição (via `requests.js` quando aplicável) e
  validam o resultado com `check()`. Um fluxo por caso de uso, reutilizado por
  todos os cenários de carga desse módulo.
- **`scenarios.js`** — formas de carga (`SMOKE`, `AVERAGE_LOAD`, `SOAK`, `STRESS`,
  `BREAKPOINT`, `SPIKE`): apenas `vus`/`duration`/`stages`, sem lógica.
- **`thresholds.js`** — critérios de aprovação/reprovação (p95, taxa de erro, taxa de checks).

## Arquivo de cenário (ex.: `login/smoke.js`)

```js
import { SMOKE } from '../lib/scenarios.js';
import { API_THRESHOLDS } from '../lib/thresholds.js';
import { loginFlow } from '../lib/flows.js';

export const options = { ...SMOKE, thresholds: API_THRESHOLDS };

export default function () {
  loginFlow();
}
```

Para fluxos que exigem autenticação prévia, o token é obtido uma vez em `setup()`
(não a cada VU) e passado ao fluxo:

```js
export function setup() {
  return { token: loginAndGetToken() };
}

export default function (data) {
  boletoConsultaFlow(data.token);
}
```

## Adicionando um novo módulo

1. Adicionar o fluxo em `flows.js` (requisição + `check()`).
2. Criar a pasta do módulo (`perf/<modulo>/`) com um arquivo por tipo de cenário
   necessário, seguindo o template acima.
3. Registrar os scripts correspondentes em `package.json`.
