import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { getResponseSchema } from './openapi';

const ajv = new Ajv({ strict: false, allErrors: true });
addFormats(ajv);

export function validateResponse(endpoint: string, method: 'get'|'post'|'put'|'delete', status: string, body: any) {
  const schema = getResponseSchema(endpoint, method, status);
  if (!schema) return; // no schema available -> skip
  const validate = ajv.compile(schema);
  const ok = validate(body);
  if (!ok) {
    const errs = (validate.errors || []).map(e => `${e.instancePath} ${e.message}`).join('; ');
    throw new Error(`Contract validation failed for ${method.toUpperCase()} ${endpoint} ${status}: ${errs}`);
  }
}
