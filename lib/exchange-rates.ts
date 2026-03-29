/**
 * @fileoverview 汇率获取工具函数库
 *
 * 提供从第三方 API 获取汇率数据的功能
 *
 * @module lib/exchange-rates
 */

export interface ExchangeRates {
  [currency: string]: number;
}

// 默认基准货币
const EXCHANGE_RATE_BASE = "CNY";
const EXCHANGE_RATE_URL = `https://api.frankfurter.dev/v1/latest?base=${EXCHANGE_RATE_BASE}`;

interface FrankfurterResponse {
  rates?: Record<string, number>;
}

export async function getExchangeRates(): Promise<ExchangeRates | null> {
  try {
    // 
    const response = await fetch(EXCHANGE_RATE_URL, {
      next: { revalidate: 720 * 60 }, // 12小时缓存
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json() as FrankfurterResponse;
    // console.log({ CNY: 1, ...(data.rates ?? {}) });
    return { CNY: 1, ...(data.rates ?? {}) };
  } catch {
    return null;
  }
}
