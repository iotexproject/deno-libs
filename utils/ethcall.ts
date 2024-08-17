import { Contract, Provider } from 'npm:ethcall@4.3.1';
import { JsonRpcProvider } from 'npm:@ethersproject/providers';
import config from '../config/index.json' assert { type: 'json' };

function getEthCall({
  chainId,
  chainName,
}: {
  chainId?: number | string;
  chainName?: string;
}) {
  // deno-lint-ignore ban-ts-comment
  // @ts-ignore
  const chainConfig = chainId ? config.chain[chainId] : config.chain[chainName];

  const ethcallProvider = new Provider();
  ethcallProvider.provider = new JsonRpcProvider(chainConfig.rpcURL);
  ethcallProvider.multicall2 = {
    address: chainConfig.multicallAddress,
    block: 0,
  };
  return ethcallProvider;
}

export { getEthCall, Contract };
