import { CoinGeckoClient } from 'npm:coingecko-api-v3';

const client = new CoinGeckoClient({
  timeout: 10000,
  autoRetry: true,
});

function hook(originalFunction: Function, args: any[]) {
  console.log('hook', originalFunction.name);
  return false;
}

const clientProxy = new Proxy(client, {
  get(target, property, receiver) {
    const originalFunction = Reflect.get(target, property, receiver);

    // 如果这个属性是一个函数，那么我们就返回一个代理函数
    if (typeof originalFunction === 'function') {
      return function (...args: any[]) {
        // 首先调用你的钩子函数
        const r = hook(originalFunction, args);
        if (r) {
          return r;
        }

        // 然后调用原始的库函数
        return originalFunction.apply(client, args);
      };
    } else {
      // 如果这个属性不是一个函数，那么我们就直接返回它
      return originalFunction;
    }
  },
});

const r = await clientProxy.simplePrice({
  ids: ['bitcoin', 'ethereum'],
});

console.log(r);
