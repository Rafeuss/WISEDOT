import './commands';

const KNOWN_APP_ERRORS = ['/undefined/notification'];

Cypress.on('uncaught:exception', (err) => {
  if (KNOWN_APP_ERRORS.some((pattern) => err.message.includes(pattern))) {
    return false;
  }
  return undefined;
});
