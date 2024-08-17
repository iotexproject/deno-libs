import axios from 'npm:axios';

/**
 * test pr
 * @param url
 */
export const coingeckoFetch = async (url: string) => {
  const res = await axios({
    method: 'get',
    url: `https://api.coingecko.com/api/v3${url}`,
  });
  return res;
};
