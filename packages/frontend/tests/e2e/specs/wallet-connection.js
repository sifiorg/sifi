describe('connect wallet spec', () => {
  before(() => {
    cy.visit('/');
  });

  it('should connect wallet with success', () => {
    cy.contains('button', 'Connect Wallet').click();
    cy.contains('button', 'MetaMask').click();
    cy.acceptMetamaskAccess();
    cy.contains('span', '0x75...BfFB').should('be.visible');
  });
});
