const Ajv = require('ajv');

const ajv = new Ajv({ allErrors: true });

function listAllMarketShares() {
  return cy.request('GET', '/market-share?page=1&size=50');
}

describe('API - Market Share', () => {
  before(() => {
    cy.seedMarketShares();
  });

  // CT-API-MKT-01 - Lista os produtos seedados
  it('deve listar os produtos de investimento seedados', () => {
    listAllMarketShares().then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.data.total).to.be.at.least(14);

      const names = response.body.data.data.map((item) => item.name);
      expect(names).to.include('ARX Denial FIC FIRF CP');
      expect(names).to.include('Trígono 70 Previdência FIC Multimercado');
    });
  });

  // CT-API-MKT-02 - Busca por nome
  it('deve filtrar corretamente por nome (busca parcial "ARX")', () => {
    cy.request('GET', '/market-share/search?query=ARX').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.data).to.have.length(2);
      response.body.data.forEach((item) => {
        expect(item.name).to.match(/ARX/i);
      });
    });
  });

  // CT-API-MKT-03 - Filtro por risco
  it('deve filtrar corretamente por nivel de risco', () => {
    cy.request('GET', '/market-share/filter-by-risk?risk=ALTO').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.data.data.length).to.be.at.least(4);
      response.body.data.data.forEach((item) => {
        expect(item.risk).to.eq('ALTO');
      });
    });
  });

  // CT-API-MKT-04 - Busca um produto especifico pelo ID
  it('deve retornar um produto especifico pelo ID', () => {
    listAllMarketShares().then((response) => {
      const target = response.body.data.data[0];

      cy.request('GET', `/market-share/${target.id}`).then((byIdResponse) => {
        expect(byIdResponse.status).to.eq(200);
        expect(byIdResponse.body.data).to.have.property('id', target.id);
        expect(byIdResponse.body.data).to.have.property('name', target.name);
      });
    });
  });

  // CT-API-MKT-05 - ID inexistente
  it('deve retornar 404 para um ID de produto inexistente', () => {
    const nonExistentId = '11111111-1111-4111-8111-111111111111';

    cy.request({
      method: 'GET',
      url: `/market-share/${nonExistentId}`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });

  // CT-API-MKT-06 - Contrato/schema de um item da lista 
  it('deve respeitar o contrato de schema de um item da lista (ajv)', () => {
    cy.fixture('market-share.schema.json').then((schema) => {
      listAllMarketShares().then((response) => {
        const [firstItem] = response.body.data.data;
        const validate = ajv.compile(schema);
        const isValid = validate(firstItem);

        expect(isValid, JSON.stringify(validate.errors)).to.be.true;
      });
    });
  });
});
