// deno-lint-ignore ban-types
export const timeLog = (namespace: string, func: Function) => {
  console.time(namespace);
  let res = func();
  if (res instanceof Promise) {
    return res.finally(() => {
      console.timeEnd(namespace);
    });
  }
  console.timeEnd(namespace);
  return res;
};
