import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  Products,
  CountryCode,
} from "plaid";
import type { BankingService, BankAccount, ExchangeTokenResult } from "./types";

function getPlaidClient(): PlaidApi {
  const configuration = new Configuration({
    basePath:
      PlaidEnvironments[
        process.env.PLAID_ENV as keyof typeof PlaidEnvironments
      ] || PlaidEnvironments.sandbox,
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
        "PLAID-SECRET": process.env.PLAID_SECRET,
      },
    },
  });

  return new PlaidApi(configuration);
}

export const plaidAdapter: BankingService = {
  async createLinkToken(userId: string): Promise<string> {
    const plaidClient = getPlaidClient();
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: userId },
      client_name: "NetworthApp",
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: "en",
    });

    return response.data.link_token;
  },

  async exchangePublicToken(publicToken: string): Promise<ExchangeTokenResult> {
    const plaidClient = getPlaidClient();

    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    // Get item info for institution details
    const itemResponse = await plaidClient.itemGet({
      access_token: accessToken,
    });

    const institutionId = itemResponse.data.item.institution_id || null;
    let institutionName: string | null = null;

    if (institutionId) {
      try {
        const instResponse = await plaidClient.institutionsGetById({
          institution_id: institutionId,
          country_codes: [CountryCode.Us],
        });
        institutionName = instResponse.data.institution.name;
      } catch {
        // Institution name is optional, continue without it
      }
    }

    // Get accounts
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    const accounts: BankAccount[] = accountsResponse.data.accounts.map(
      (acc) => ({
        id: acc.account_id,
        name: acc.name,
        officialName: acc.official_name || null,
        type: acc.type,
        subtype: acc.subtype || null,
        mask: acc.mask || null,
        currentBalance: acc.balances.current,
        availableBalance: acc.balances.available,
        isoCurrencyCode: acc.balances.iso_currency_code || null,
      })
    );

    return {
      accessToken,
      itemId,
      institutionId,
      institutionName,
      accounts,
    };
  },

  async getAccounts(accessToken: string): Promise<BankAccount[]> {
    const plaidClient = getPlaidClient();
    const response = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    return response.data.accounts.map((acc) => ({
      id: acc.account_id,
      name: acc.name,
      officialName: acc.official_name || null,
      type: acc.type,
      subtype: acc.subtype || null,
      mask: acc.mask || null,
      currentBalance: acc.balances.current,
      availableBalance: acc.balances.available,
      isoCurrencyCode: acc.balances.iso_currency_code || null,
    }));
  },
};
