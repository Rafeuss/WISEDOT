const ACCOUNT_FIELD_SELECTORS = {
  email: '#user-email',
  agencia: '#user-agency',
  conta: '#user-account',
  instituicao: '#user-instituition',
};

Cypress.Commands.add('uiPerfilOpenProfileMenu', () => {
  cy.uiHomeOpenAccountMenu();
});

Cypress.Commands.add('uiPerfilExpectAccountDetailsVisible', () => {
  cy.get('#profile-modal').within(() => {
    cy.contains('Agência').should('be.visible');
    cy.contains('Conta').should('be.visible');
    cy.contains('Instituição').should('be.visible');
  });
});

Cypress.Commands.add('uiPerfilLogout', () => {
  cy.uiHomeLogoutFromAccountMenu();
});

Cypress.Commands.add('uiPerfilClickLogoutIcon', () => {
  cy.uiHomeClickLogoutDoorIcon();
});

Cypress.Commands.add('uiPerfilStubClipboard', () => {
  cy.window().then((win) => {
    cy.stub(win.navigator.clipboard, 'writeText').as('clipboardWrite');
  });
});

Cypress.Commands.add('uiPerfilClickCopyButton', (field) => {
  cy.get(ACCOUNT_FIELD_SELECTORS[field]).should('be.visible').click();
});

Cypress.Commands.add('uiPerfilFieldValueText', (field) => {
  return cy.get(ACCOUNT_FIELD_SELECTORS[field]).find('span').last().invoke('text');
});

Cypress.Commands.add('uiPerfilExpectClipboardWrittenWith', (value) => {
  cy.get('@clipboardWrite').should((stub) => {
    expect(String(stub.lastCall.args[0])).to.equal(String(value));
  });
});

Cypress.Commands.add('uiPerfilExpectNoCopyConfirmationVisible', () => {
  cy.contains(/copiad/i).should('not.exist');
});

Cypress.Commands.add('uiPerfilExpectProfileCardDoesNotOverflow', () => {
  cy.get('.profile-modal').should(($el) => {
    expect($el[0].scrollWidth).to.be.at.most($el[0].clientWidth);
  });
});
