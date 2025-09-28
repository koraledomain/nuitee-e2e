import 'dotenv/config';

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export const ENV = {
  BASE_URL: required('BASE_URL'),
  API_KEY: required('LITEAPI_KEY'),
  RUN_ID: process.env.RUN_ID || `RUN-${Date.now()}-${Math.random().toString(36).slice(2,8)}`
};
