import { CoinGeckoClient } from 'npm:coingecko-api-v3';
import _ from 'npm:lodash';
import { jobhub } from './jobhub-prisma.ts';

const client = new CoinGeckoClient({
  timeout: 10000,
  autoRetry: true,
});

async function queryTokenFromCoingecko(names: string[]) {
  const r = await client.simplePrice({
    ids: names.join(','),
    vs_currencies: 'usd',
    include_market_cap: true,
  });
  return r;
}

export async function queryTokenPriceMap(tokens: string[]) {
  if (!tokens.length) return {};

  const res = await jobhub.coingecko_tokens.findMany({
    where: {
      name: {
        in: tokens,
      },
    },
    select: {
      name: true,
      data: true,
    },
  });

  const cryptoToUsd = _(res).keyBy('name').mapValues('data.usd').value();
  const existsTokens = _.map(res, 'name');

  const missingTokens = _.difference(tokens, existsTokens);
  if (!missingTokens.length) return cryptoToUsd;

  const missingTokensRes = await queryTokenFromCoingecko(missingTokens);

  const missingTokensData = Object.keys(missingTokensRes).map((key) => {
    return {
      name: key,
      data: missingTokensRes[key],
      created_at: new Date(),
      updated_at: new Date(),
    };
  });

  await jobhub.coingecko_tokens.createMany({
    data: missingTokensData,
  });

  const transferTokens = _(missingTokensData)
    .keyBy('name')
    .mapValues('data.usd')
    .value();

  return {
    ...cryptoToUsd,
    ...transferTokens,
  };
}

export async function queryCoinMarketTokenPriceMap(tokens: string[]) {
  if (!tokens.length) return {};

  const res = await jobhub.coingecko_market.findMany({
    where: {
      name: {
        in: tokens,
      },
    },
  });

  const cryptoToUsd = _(res).keyBy('name').value();
  const existsTokens = _.map(res, 'name');

  const missingTokens = _.difference(tokens, existsTokens);
  if (!missingTokens.length) return cryptoToUsd;

  const missingTokensRes = await client.coinMarket({
    vs_currency: 'usd',
    ids: missingTokens.join(','),
  });

  const missingTokensData = Object.keys(missingTokensRes).map((key) => {
    return {
      name: key,
      data: missingTokensRes[key],
      created_at: new Date(),
      updated_at: new Date(),
    };
  });

  await jobhub.coingecko_market.createMany({
    data: missingTokensData,
  });

  const transferTokens = _(missingTokensData)
    .keyBy('name')
    .mapValues('data.usd')
    .value();

  return {
    ...cryptoToUsd,
    ...transferTokens,
  };
}

export async function main() {
  const tokens = await queryTokenPriceMap(['iotex', 'solana']);
  console.log(tokens);
}

main().then(console.log).catch(console.error);
