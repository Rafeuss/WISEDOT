class RecuperacaoSenhaPage {
  visit() {
    cy.visit('/auth/forgot-password');
    return this;
  }

  fillEmail(email) {
    cy.get('#email').clear().type(email);
    return this;
  }

  submit() {
    cy.get('#enter-btn').click();
    return this;
  }

  submitButtonShouldBeDisabled() {
    cy.get('#enter-btn').should('be.disabled');
    return this;
  }

  expectStepOneVisible() {
    cy.contains('Esqueceu sua senha?').should('be.visible');
    return this;
  }

  expectOtpStepVisible() {
    cy.contains('E-mail enviado').should('be.visible');
    return this;
  }

  expectOtpStepNotVisible() {
    cy.contains('E-mail enviado').should('not.exist');
    return this;
  }
}

export default new RecuperacaoSenhaPage();
