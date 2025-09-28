import { request } from 'pactum';
import { ENV } from '../config/env';

request.setBaseUrl(ENV.BASE_URL);
request.setDefaultHeaders({
  'X-Api-Key': ENV.API_KEY,
  'Content-Type': 'application/json'
});

// Set default timeout to 30 seconds for API calls
request.setDefaultTimeout(3000);

// // gentle retries to reduce flakes on 429/5xx
// request.setDefaultRetryCount(2);
// request.setDefaultRetryDelay(500);

export { request };
