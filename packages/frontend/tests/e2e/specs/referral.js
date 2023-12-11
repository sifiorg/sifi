import { localStorageKeys } from '../../../src/utils/localStorageKeys';

describe('Referral routing', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  const referrerAddress = '0x1234567890123456789012345678901234567890';
  const feeBps = 20;
  const nativeToken = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
  const tokenFrom = nativeToken;
  const tokenTo = nativeToken;
  const chainIdFrom = 1; // Mainnet
  const chainIdTo = 137; // Polygon

  it('should handle /r/${address} route', () => {
    cy.visit(`/r/${referrerAddress}`);

    // Redirect to default swap pair without the referrer in the url
    cy.url().should('match', new RegExp(`${Cypress.config().baseUrl}/0x\\w+/0x\\w+`));

    cy.window().then(win => {
      expect(win.localStorage.getItem(localStorageKeys.REFFERRER_ADDRESS)).to.equal(
        referrerAddress
      );
      expect(win.localStorage.getItem(localStorageKeys.REFERRER_FEE_BPS)).to.be.null;
    });
  });

  it('should handle /r/${address}:${feeBps} route', () => {
    cy.visit(`/r/${referrerAddress}:${feeBps}`);

    cy.url().should('match', new RegExp(`${Cypress.config().baseUrl}/0x\\w+/0x\\w+`));

    cy.window().then(win => {
      expect(win.localStorage.getItem(localStorageKeys.REFFERRER_ADDRESS)).to.equal(
        referrerAddress
      );
      expect(win.localStorage.getItem(localStorageKeys.REFERRER_FEE_BPS)).to.equal(
        feeBps.toString()
      );
    });
  });

  it('should handle /${tokenFrom}/${chainIdFrom}/${tokenTo}/${chainIdTo} route', () => {
    cy.visit(`/${tokenFrom}/${chainIdFrom}/${tokenTo}/${chainIdTo}`);

    // URL should not be rewritten
    cy.url().should(
      'eq',
      Cypress.config().baseUrl + `/${tokenFrom}/${chainIdFrom}/${tokenTo}/${chainIdTo}`
    );
  });

  it('should handle /r/${address}:${feeBps}/${tokenFrom}${chainIdFrom}/${tokenTo}${chainIdTo} route', () => {
    cy.visit(`/r/${referrerAddress}:${feeBps}/${tokenFrom}${chainIdFrom}/${tokenTo}${chainIdTo}`);

    cy.url().should(
      'eq',
      Cypress.config().baseUrl + `/${tokenFrom}${chainIdFrom}/${tokenTo}${chainIdTo}`
    );

    cy.window().then(win => {
      expect(win.localStorage.getItem(localStorageKeys.REFFERRER_ADDRESS)).to.equal(
        referrerAddress
      );
      expect(win.localStorage.getItem(localStorageKeys.REFERRER_FEE_BPS)).to.equal(
        feeBps.toString()
      );
    });
  });
});
