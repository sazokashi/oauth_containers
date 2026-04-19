type PipeFn = (arg: any) => any;

const pipe =
  (...fns: PipeFn[]) =>
  (value: any): any =>
    fns.reduce((current, fn) => fn(current), value);

const pipeAsync =
  (...fns: PipeFn[]) =>
  (value: any): Promise<any> =>
    fns.reduce(async (current, fn) => fn(await current), value);

const compose =
  (...fns: PipeFn[]) =>
  (value: any): any =>
    fns.reduceRight((current, fn) => fn(current), value);

const wrap =
  (key: string) =>
  (value: any): Record<string, any> => ({
    [key]: value
  });

const append =
  (extra: Record<string, unknown>) =>
  (value: Record<string, unknown>): Record<string, unknown> => ({
    ...value,
    ...extra
  });

export { pipe, pipeAsync, compose, wrap, append };
