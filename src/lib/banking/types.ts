export interface BankAccount {
  id: string;
  name: string;
  officialName: string | null;
  type: string;
  subtype: string | null;
  mask: string | null;
  currentBalance: number | null;
  availableBalance: number | null;
  isoCurrencyCode: string | null;
}

export interface ExchangeTokenResult {
  accessToken: string;
  itemId: string;
  institutionId: string | null;
  institutionName: string | null;
  accounts: BankAccount[];
}

export interface BankingService {
  createLinkToken(userId: string): Promise<string>;
  exchangePublicToken(publicToken: string): Promise<ExchangeTokenResult>;
  getAccounts(accessToken: string): Promise<BankAccount[]>;
}
