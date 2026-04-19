export const ok = (body: Record<string, unknown>) => ({
  status: 200,
  body
});

export const created = (body: Record<string, unknown>) => ({
  status: 201,
  body
});

export const accepted = (body: Record<string, unknown>) => ({
  status: 200,
  body
});

export const badRequest = (message: string) => {
  throw Object.assign(new Error(message), { status: 400 });
};

export const notFound = (message: string) => {
  throw Object.assign(new Error(message), { status: 404 });
};
