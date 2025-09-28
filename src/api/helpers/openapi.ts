import fs from 'node:fs';
import path from 'node:path';

export type Method = 'get' | 'post' | 'put' | 'delete' | 'patch';

let OPENAPI: any;

export function loadOpenAPI(): any {
  if (!OPENAPI) {
    const p = path.join(process.cwd(), 'schemas', 'openapi.json');
    OPENAPI = JSON.parse(fs.readFileSync(p, 'utf-8'));
  }
  return OPENAPI;
}

export function getResponseSchema(pathKey: string, method: Method, status = '200') {
  const spec = loadOpenAPI();
  const node = spec.paths?.[pathKey]?.[method];
  return node?.responses?.[status]?.content?.['application/json']?.schema || null;
}

export function getRequestSchema(pathKey: string, method: Method) {
  const spec = loadOpenAPI();
  const node = spec.paths?.[pathKey]?.[method];
  return node?.requestBody?.content?.['application/json']?.schema || null;
}
