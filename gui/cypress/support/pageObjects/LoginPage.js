class LoginPage {
  visit() {
    cy.visit('/');
    return this;
  }

  // O formulario valida no modo "onBlur" (react-hook-form) - um blur explicito
  // apos digitar evita flakiness esperando a revalidacao de isValid antes do submit.
  fillEmail(email) {
    cy.get('input[type="email"], input[name="email"]').first().clear().type(email).blur();
    return this;
  }

  fillPassword(password) {
    cy.get('input[type="password"], input[name="password"]').first().clear().type(password).blur();
    return this;
  }

  submit() {
    cy.contains('button', 'Entrar').should('not.be.disabled').click();
    return this;
  }

  submitButtonShouldBeDisabled() {
    cy.contains('button', 'Entrar').should('be.disabled');
    return this;
  }

  expectErrorToast(message) {
    cy.contains(message, { timeout: 6000 }).should('be.visible');
    return this;
  }

  expectInlineError(message) {
    cy.contains(message).should('be.visible');
    return this;
  }
}

export default new LoginPage();
