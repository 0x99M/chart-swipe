import { BybitGetTickersResponse, BybitTicker } from "@/types/bybit";

const BYBIT_BASE_API = "https://api.bybit.com/v5/market";
const BYBIT_TICKERS_API = `${BYBIT_BASE_API}/tickers`;

export const bybitService = {
  getTickers: async (): Promise<BybitTicker[]> => {
    const query = `category=spot`;
    const response = await fetch(`${BYBIT_TICKERS_API}?${query}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch tickers from Bybit - ${response.statusText}`);
    }

    const data: BybitGetTickersResponse = await response.json();

    if (data.retCode !== 0) {
      throw new Error(`Failed to fetch tickers from Bybit - ${response.statusText}`);
    }

    return data.result.list;
  },
}