type PipeFn = (arg: any) => any;

export const pipeAsync =
  (...fns: PipeFn[]) =>
  (value: any): Promise<any> =>
    fns.reduce(async (current, fn) => fn(await current), value);
